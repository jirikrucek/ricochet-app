#!/usr/bin/env bash
# Posts OpenCode's pull request review. The review itself runs in an earlier,
# read-only job, which runs third-party code (OpenCode and the model behind
# it) and hands over the model's reply and the diff it reviewed. This script
# runs in a fresh job with pull-requests write and runs none of that code.
#
# The reply is as untrusted as the pull request that prompted it, so only its
# text reaches GitHub: this script picks the pull request, the commit and the
# review event (always COMMENT, never APPROVE or REQUEST_CHANGES) itself.
#
# Environment:
#   GH_TOKEN           token with pull-requests write
#   GITHUB_REPOSITORY  owner/repo
#   PR_NUMBER          pull request to review
#   HEAD_SHA           commit the review was made on
#   REVIEW_FILE        the model's reply, as extract-review.mjs wrote it:
#                      {"summary": "...", "comments": [{"path", "line", "severity", "body"}]}
#   DIFF_FILE          the diff the model reviewed (git diff base...head)
#   MODEL              model that wrote the review, for the footer
#   RUN_URL            URL of the workflow run, for the footer
#   DRY_RUN            true to print the review instead of posting it

set -euo pipefail

if ! [[ "$PR_NUMBER" =~ ^[0-9]+$ && "$HEAD_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo "::error::Unexpected pull request number or commit SHA"
  exit 1
fi

work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

if ! jq -e 'type == "object" and (.summary | type == "string") and (.comments | type == "array")' "$REVIEW_FILE" >/dev/null 2>&1; then
  echo "::error::The model's reply is not a review object; see the review job's output"
  exit 1
fi

# Lines a review comment can sit on: the new side of each hunk, that is
# added and unchanged context lines, as "path<TAB>line".
awk '
  /^diff --git / { path = ""; inhunk = 0; next }
  !inhunk && /^\+\+\+ / {
    path = substr($0, 5)
    if (path == "/dev/null") path = ""; else sub(/^b\//, "", path)
    next
  }
  /^@@ / {
    split($0, f, " ")
    split(substr(f[2], 2), o, ","); split(substr(f[3], 2), n, ",")
    oldleft = (2 in o) ? o[2] + 0 : 1
    newleft = (2 in n) ? n[2] + 0 : 1
    line = n[1] + 0
    inhunk = (oldleft > 0 || newleft > 0)
    next
  }
  inhunk {
    c = substr($0, 1, 1)
    if (c == " ") { if (path != "") print path "\t" line; line++; oldleft--; newleft-- }
    else if (c == "+") { if (path != "") print path "\t" line; line++; newleft-- }
    else if (c == "-") { oldleft-- }
    if (oldleft <= 0 && newleft <= 0) inhunk = 0
  }
' "$DIFF_FILE" >"$work/lines.tsv"

# Build the review. Comments on a line the diff shows go inline; the rest
# are listed in the body. Each text is capped, and @mentions are broken with
# a zero-width space, so the reply can't notify people or teams.
jq -n \
  --slurpfile replies "$REVIEW_FILE" \
  --rawfile lines "$work/lines.tsv" \
  --arg sha "$HEAD_SHA" \
  --arg model "$MODEL" \
  --arg run "$RUN_URL" '
  def clean($max): tostring | gsub("(?<p>^|[^A-Za-z0-9_.])@(?<w>[A-Za-z0-9])"; "\(.p)@​\(.w)") | .[0:$max];
  def icon: {critical: "🔴", major: "🟠", minor: "🟡"}[.] // "⚪";
  $replies[0] as $reply
  | ($lines | split("\n") | map(select(. != "")) | map({(.): true}) | add // {}) as $ok
  | [$reply.comments[:30][]
      | select(type == "object" and (.path | type == "string") and (.body | type == "string"))
      | {path: (.path | sub("^\\./"; "")),
         line: (if (.line | type) == "number" and .line >= 1 then (.line | floor) else null end),
         severity: (if .severity | IN("critical", "major", "minor") then .severity else "minor" end),
         body: (.body | clean(4000))}
      | .inline = (.line != null and $ok[.path + "\t" + (.line | tostring)] == true)
    ] as $found
  | ($found | map(select(.inline | not))) as $other
  | {
      commit_id: $sha,
      event: "COMMENT",
      body: ([
          "## OpenCode review",
          ($reply.summary | clean(4000)),
          (if ($other | length) > 0 then
             "### Findings outside the diff\n\n"
             + ($other | map("- \(.severity | icon) **\(.severity)** `\(.path | clean(300))`\(if .line then ":\(.line)" else "" end): \(.body)") | join("\n"))
           else empty end),
          "<sub>\(($found | length)) finding(s), \(($found | map(select(.inline)) | length)) inline · `\($model)` on \($sha[0:7]) · [run](\($run)) · automated review: it can be wrong</sub>"
        ] | join("\n\n")),
      comments: ($found | map(select(.inline) | {path, line, side: "RIGHT", body: "\(.severity | icon) **\(.severity)**\n\n\(.body)"}))
    }
' >"$work/review.json"

jq -r '"Review: \(.comments | length) inline comment(s)"' "$work/review.json"

if [ "${DRY_RUN:-false}" = "true" ]; then
  jq . "$work/review.json"
  exit 0
fi

# GitHub rejects the whole review when one inline comment doesn't fit the
# diff. The lines were checked above, but if GitHub still disagrees, post
# the findings in the body instead of losing them.
endpoint="repos/$GITHUB_REPOSITORY/pulls/$PR_NUMBER/reviews"
if ! gh api --method POST "$endpoint" --input "$work/review.json" >/dev/null; then
  echo "::warning::GitHub rejected the inline comments; posting every finding in the review body"
  jq '.body += "\n\n### Inline findings\n\n" + (.comments | map("- `\(.path)`:\(.line): \(.body | gsub("\n\n"; " "))") | join("\n"))
      | .comments = []' "$work/review.json" >"$work/fallback.json"
  gh api --method POST "$endpoint" --input "$work/fallback.json" >/dev/null
fi
echo "Posted the review on pull request #$PR_NUMBER"
