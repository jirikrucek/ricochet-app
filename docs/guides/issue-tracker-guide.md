# Issue Tracker Guide

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`. It prints the comment's URL; the number after `#issuecomment-` is the comment id.
- **Tick the workflow checklist**: rewrite its comment by id, `gh api -X PATCH repos/{owner}/{repo}/issues/comments/<id> -F body=@<file>`, with the whole updated checklist in `<file>`. Find the id with `gh api repos/{owner}/{repo}/issues/<number>/comments --jq '.[] | select(.body | startswith("## Workflow checklist")) | .id'`. Editing by id keeps later comments untouched, unlike `--edit-last`.
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either — resolve with `gh pr view 42` and fall back to `gh issue view 42`.
