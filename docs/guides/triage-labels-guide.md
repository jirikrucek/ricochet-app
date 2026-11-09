# Triage Labels Guide

Labels fall into two groups. The tables below are the source of truth for the repo's GitHub labels: name, meaning (the GitHub description) and color.

| Group | Question it answers         | Labels per issue                                      |
| ----- | --------------------------- | ----------------------------------------------------- |
| Type  | What does the issue change? | One or more, since one change can touch several areas |
| State | Whose turn is it?           | Exactly one on an open issue                          |

## Type

Pick the label whose **Covers** column names the files the issue touches.

| Label           | Meaning                                                        | Covers                                                                                                                                              | Color    |
| --------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `bug`           | Something in the app isn't working                             | App behaves wrongly                                                                                                                                 | `d73a4a` |
| `enhancement`   | New feature or improvement to the app                          | App behavior changes, including `openspec/` specs                                                                                                   | `a2eeef` |
| `documentation` | Improvements or additions to documentation in docs/ and README | `docs/` (guides, standards, ADRs, references), `README.md`                                                                                          | `0075ca` |
| `dependencies`  | Updates to dependencies in package.json                        | `package.json`, `package-lock.json`                                                                                                                 | `0366d6` |
| `config`        | Configuration of tooling, CI, build, dev container, deployment | Tool configs (`vite`, `vitest`, `playwright`, `eslint`, `prettier`, `tailwind`, `tsconfig`), `.github/workflows/`, `.devcontainer/`, `vercel.json` | `c5def5` |
| `harness`       | Agent setup: AGENTS.md, CLAUDE.md, agent skills                | `AGENTS.md`, `CLAUDE.md`, `.agents/`, `.claude/`                                                                                                    | `5319e7` |

## State

The state names who acts next on an open issue.

| Label             | Meaning                                                                | Color    |
| ----------------- | ---------------------------------------------------------------------- | -------- |
| `needs-triage`    | Maintainer needs to evaluate this issue                                | `fbca04` |
| `ready-for-human` | A human acts next (HITL, human in the loop): implement, give information, decide or review | `006b75` |
| `ready-for-agent` | An agent acts next (AFK, away from keyboard): work on it unattended    | `0e8a16` |

A new issue starts at `needs-triage`.

## Closing

GitHub's close reason records how an issue ended, so no label does. Close with the reason that fits:

- **Completed**: the work is done. A merged PR with `Closes #<number>` does this.
- **Not planned**: the issue will not be worked on. Comment the reason.
- **Duplicate**: the issue already exists. Comment a link to the original.

## Keeping GitHub in sync

When `gh label list` differs from the tables above, change GitHub to match them:

- Add a label: `gh label create "<name>" --description "<meaning>" --color "<color>"`.
- Change a label: `gh label edit "<name>" --description "<meaning>" --color "<color>"`.
- Remove a label: `gh label delete "<name>" --yes`.
