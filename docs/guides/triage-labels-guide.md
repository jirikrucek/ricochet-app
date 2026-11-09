# Triage Labels Guide

Labels fall into three groups. The tables below are the source of truth for the repo's GitHub labels: name, meaning (the GitHub description) and color.

| Group | Question it answers         | Labels per issue                                      |
| ----- | --------------------------- | ----------------------------------------------------- |
| Type  | What does the issue change? | One or more, since one change can touch several areas |
| Mode  | Who works on it?            | At most one                                           |
| State | Where does it stand?        | At most one                                           |

Work on an issue starts when it has the `ready` state and a mode label. The mode label says who starts: `agent` means an agent can start AFK, `human` means a human does.

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

## Mode

Who works on the issue. Triage sets it, even while the issue still waits on `needs-info`.

| Label   | Meaning                                                   | Color    |
| ------- | --------------------------------------------------------- | -------- |
| `agent` | An agent works on it unattended (AFK, away from keyboard) | `f9d0c4` |
| `human` | A human works on it, in the loop (HITL)                   | `006b75` |

## State

Where an open issue stands. A new issue starts at `needs-triage`; triage replaces it with the label that fits.

| Label          | Meaning                                  | Color    |
| -------------- | ---------------------------------------- | -------- |
| `needs-triage` | Maintainer needs to evaluate this issue  | `fbca04` |
| `needs-info`   | Waiting on reporter for more information | `d876e3` |
| `ready`        | Fully specified; work can start          | `0e8a16` |

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
