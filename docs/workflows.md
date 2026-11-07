# Workflows

This document covers main workflows used for this codebase.

## Development Workflow

When working on any change in the codebase, follow these steps:

1) Create change - use /openspec-new-change skill to start a change proposal as an empty scaffold
2) Write spec - use /openspec-continue-change skill to create the next planning artifact in a change proposal, one at a time; loop until all planning artifacts are created
3) Implement - use /openspec-apply-change skill to implement a change proposal's tasks, working through the list until done or blocked
4) Verify - use /openspec-verify-change skill to check that the implementation matches the change proposal's artifacts
5) Archive change - use /openspec-archive-change skill to move a finished change proposal to the archive

## Maintenance Workflows

To maintain the codebase, use the following workflows:

- Improve codebase architecture - use /improve-codebase-architecture skill to find the modules worth refactoring, as a visual report
- Diagnose a bug - use /diagnosing-bugs skill to diagnose a hard bug, starting from a repro that fails
- Validate ADRs - use /validate-adrs skill to validate that the ADRs in docs/adr are sound
- Validate guides - use /validate-guides to validate that the guides in docs/guides work as written
- Validate standards - use /validate-standards skill to validate that the standards in docs/standards are sound
- Audit - use /audit skill to audit the codebase for violations of the standards and accepted ADRs, fix the approved ones, and commit after review

## R&D Workflows

To R&D, use the following workflows:

- Explore - use /openspec-explore skill to think through an idea before it becomes a change proposal
- Research - use /research skill to get a cited answer, read from primary sources
- Prototype - use /prototype skill to answer a design question with code you then delete

## Productivity Workflows

To work efficiently, use the following workflows:

- Grilling - use /grilling skill to align on an idea before committing to it
- Hand-off - use /handoff skill to write up a long session so another agent can continue it

## Harness Improvement Workflows

To improve harness, use the following workflows:

- Retrospective - use /retro skill to look back over a coding session and suggests improvements to the agent's environment, so the next run goes better
- Write for agents - use /writing-for-agents skill to write skills and other documents agents read