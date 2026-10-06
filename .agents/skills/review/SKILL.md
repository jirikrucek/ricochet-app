---
name: review
description: "Pre-merge review of the current branch through six lenses (quality, simplification, security, performance, observability, launch readiness), run in parallel sub-agents."
disable-model-invocation: true
---

Review the diff between `HEAD` and a fixed point through six **lenses**, each a separate skill run by its own sub-agent so no lens pollutes another's context. This skill dispatches and aggregates; the lens skills hold the criteria.

| Lens          | Skill                             |
| ------------- | --------------------------------- |
| Quality       | `code-review-and-quality`         |
| Simplicity    | `code-simplification`             |
| Security      | `security-and-hardening`          |
| Performance   | `performance-optimization`        |
| Observability | `observability-and-instrumentation` |
| Launch        | `shipping-and-launch`             |

## Process

### 1. Pin the fixed point

The review target is the agent session's work: the branch's commits plus the uncommitted working tree. The fixed point is whatever the user supplied (SHA, branch, tag); default to `main`.

Capture the commands once:

- Diff: `git diff $(git merge-base <fixed-point> HEAD)` (merge-base to working tree, so commits, staged and unstaged edits all appear).
- New files: `git ls-files --others --exclude-standard` (untracked files the diff misses; each lens reads them directly).
- Commits: `git log <fixed-point>..HEAD --oneline` (empty when the work is uncommitted).

Confirm `git rev-parse <fixed-point>` resolves and the diff or the new-file list is non-empty. A bad ref or nothing to review ends the run here, before any sub-agent starts.

### 2. Dispatch six sub-agents in one turn

Send all six Agent calls in a single message so they run in parallel. Each prompt carries:

- The diff command, new-file list, and commit list.
- The lens skill to invoke by name, applied to the diff.
- The brief: "Review only; report findings and leave the code unedited. Per finding: file and line, the issue, the severity (critical / important / suggestion), and the fix. Name what the lens found clean in one line. Under 400 words."

### 3. Aggregate

Done when all six lenses have reported, or a failed lens is named as failed. Present one `## <Lens>` section per lens, in table order, verbatim or lightly cleaned. The lenses stay separate: merging or reranking across them would let a loud lens mask a quiet one.

End with a per-lens count of critical findings and the single worst finding _within each lens_.
