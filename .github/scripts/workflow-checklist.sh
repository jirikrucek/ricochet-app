#!/usr/bin/env bash
# Posts the workflow checklist comment on an issue, or replaces its body to
# tick steps, for @claude runs (#177). Those runs may call this script but
# not gh itself, so the method, the endpoint and the repository are fixed
# here: the run supplies only a file holding the checklist, and can write
# no comment but its own checklist on its own issue. claude.yml installs a
# root-owned copy from the default branch, with an `issue` file beside it
# naming the run's issue, so the run can't edit what it executes or pick
# another issue.
#
# When the issue has the repository owner's checklist and none of the bot's,
# the script leaves it alone and fails instead of posting a second one.
#
# Usage: workflow-checklist.sh <checklist-file>
#   checklist-file  the whole comment, starting with "## Workflow checklist"
# Prints "created <url>" or "updated <url>". Exits 1 when the owner has
# posted the checklist, 2 on bad input or setup, 3 when a gh call fails.
#
# Environment:
#   GITHUB_REPOSITORY        owner/repo, set by GitHub Actions
#   GH_TOKEN or GITHUB_TOKEN token that can write issue comments

set -euo pipefail

heading='## Workflow checklist'
# The login of the Claude GitHub App, which the @claude run posts as.
author='claude[bot]'

# A failed gh call exits 3, after gh's own error, so a caller can tell it
# from bad input (2) and from the owner's checklist (1).
fail() {
  echo "$1" >&2
  exit 3
}

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <checklist-file>" >&2
  exit 2
fi
file=$1

issue=$(cat "$(dirname "$0")/issue" 2> /dev/null || true)
if ! [[ "$issue" =~ ^[1-9][0-9]*$ ]]; then
  echo "This run has no issue to post a workflow checklist on" >&2
  exit 2
fi
if ! [[ "${GITHUB_REPOSITORY:-}" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]]; then
  echo "GITHUB_REPOSITORY must be set to owner/repo" >&2
  exit 2
fi
if [[ -z "${GH_TOKEN:-${GITHUB_TOKEN:-}}" ]]; then
  echo "GH_TOKEN or GITHUB_TOKEN must hold a token that can write issue comments" >&2
  exit 2
fi
if ! [[ -f "$file" && -r "$file" ]]; then
  echo "The checklist file must be a readable file" >&2
  exit 2
fi
body=$(< "$file")
# The heading check also keeps the script from posting any other file.
if [[ "$body" != "$heading"* ]]; then
  echo "The checklist must start with \"$heading\"" >&2
  exit 2
fi

# Only the bot's and the owner's checklists count, so no other commenter
# can block the bot's.
owner=${GITHUB_REPOSITORY%%/*}
comments=$(gh api --paginate "repos/$GITHUB_REPOSITORY/issues/$issue/comments" \
  --jq ".[] | select(.body | startswith(\"$heading\")) | [.id, .user.login] | @tsv" |
  awk -F '\t' -v a="$author" -v o="$owner" '$2 == a || $2 == o') ||
  fail "Could not list the comments of issue #$issue"

own_id=$(awk -F '\t' -v a="$author" '$2 == a { print $1; exit }' <<< "$comments")
if [[ -z "$own_id" && -n "$comments" ]]; then
  echo "Issue #$issue already has a workflow checklist by $owner: ask the owner to update it" >&2
  exit 1
fi

# -f sends the body as a raw string: gh reads no file even if it starts with @.
if [[ -n "$own_id" ]]; then
  url=$(gh api -X PATCH "repos/$GITHUB_REPOSITORY/issues/comments/$own_id" -f body="$body" --jq .html_url) ||
    fail "Could not update the workflow checklist comment $own_id on issue #$issue"
  echo "updated $url"
else
  url=$(gh api -X POST "repos/$GITHUB_REPOSITORY/issues/$issue/comments" -f body="$body" --jq .html_url) ||
    fail "Could not post the workflow checklist on issue #$issue"
  echo "created $url"
fi
