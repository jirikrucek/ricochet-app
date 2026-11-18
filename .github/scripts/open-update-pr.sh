#!/usr/bin/env bash
# Opens the pull request for an automated update. The update itself runs in
# an earlier, read-only job, which runs third-party code (npm, the skills
# CLI, OpenSpec) and hands over its changes as a patch. This script runs in
# a fresh job with write access and runs none of that code, so nothing it
# left behind (a hook, a PATH entry, a process) can reach the token.
#
# Environment:
#   GH_TOKEN     token with contents and pull-requests write
#                (and actions write when VERIFY is true)
#   BASE_BRANCH  branch the pull request targets
#   BRANCH       branch to create, chore/update-<what>-<date or version>
#   PATCH        the update job's patch (git diff --cached --binary)
#   ALLOWED_PATHS
#                space-separated files and folders (ending in /) the patch
#                may change; any other path fails the run
#   TITLE        commit message and pull request title
#   BODY         pull request body
#   VERIFY       true to start the Verification checks on the branch, as
#                pushes made with GITHUB_TOKEN don't start them

set -euo pipefail

# The update job ran third-party code, so its branch name and patch are as
# untrusted as that code: check both before they reach git.
if ! [[ "$BRANCH" =~ ^chore/update-[a-z]+-[0-9a-z.]+$ ]]; then
  echo "::error::Unexpected branch name from the update job"
  exit 1
fi

auth=$(printf 'x-access-token:%s' "$GH_TOKEN" | base64 -w0)
# GitHub masks the token in logs, but not its base64 form.
echo "::add-mask::$auth"
git_auth=(-c "http.https://github.com/.extraheader=AUTHORIZATION: basic $auth")

# A branch from an earlier run belongs to its pull request, which may have
# commits added since: leave both as they are. A branch without one is left
# by a run that failed after its push; it may hold an older update, so a
# human decides, and the run fails until then.
if git "${git_auth[@]}" ls-remote --exit-code --heads origin "$BRANCH" > /dev/null; then
  prs=$(gh pr list --head "$BRANCH" --state all --json number --jq length)
  if [ "$prs" -gt 0 ]; then
    echo "::notice::$BRANCH already exists with its pull request, so both are left as they are."
    exit 0
  fi
  echo "::error::$BRANCH exists without a pull request. Open one for it, or delete the branch so the next run recreates it."
  exit 1
elif [ $? -ne 2 ]; then
  echo "::error::Could not check whether $BRANCH exists on origin"
  exit 1
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git checkout -b "$BRANCH"
git apply --index "$PATCH"
read -r -a allowed <<< "$ALLOWED_PATHS"
outside=()
while IFS= read -r path; do
  ok=false
  for entry in "${allowed[@]}"; do
    if [ "$path" = "$entry" ] || { [[ "$entry" == */ ]] && [[ "$path" == "$entry"* ]]; }; then
      ok=true
      break
    fi
  done
  $ok || outside+=("$path")
done < <(git diff --cached --name-only)
if [ "${#outside[@]}" -gt 0 ]; then
  echo "::error::The update changes paths outside ${ALLOWED_PATHS}: ${outside[*]}"
  exit 1
fi
git commit -m "$TITLE"
# Without --force: if the branch appeared since the check, fail.
git "${git_auth[@]}" push origin "$BRANCH"
gh pr create --base "$BASE_BRANCH" --head "$BRANCH" --title "$TITLE" --body "$BODY"

if [ "${VERIFY:-}" = true ]; then
  gh workflow run verification-checks.yml --ref "$BRANCH"
fi
