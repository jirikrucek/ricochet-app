# Domain Docs

How engineering skills should consume this repo's domain documentation.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root, or **`GLOSSARY-MAP.md`** if it exists; read the glossary for the context relevant to your task.
- **`docs/adr/`**: read ADRs that touch the area you're about to work in. In a multi-context repo, also check `src/<context>/docs/adr/` for context-scoped decisions.

If these files don't exist, proceed silently. Don't flag their absence or suggest creating them upfront; domain-modeling skills create them when domain terms or decisions are resolved.

## File structure

This repo uses a single-context layout:

```
/
├── GLOSSARY.md
├── docs/adr/
└── src/
```

Multi-context repos use a root `GLOSSARY-MAP.md` to point to a `GLOSSARY.md` for each context, with system-wide ADRs in `docs/adr/` and context-specific ADRs under `src/<context>/docs/adr/`.

## Use the glossary's vocabulary

When naming a domain concept, use the term defined in the relevant `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids. If a concept isn't defined, reconsider whether the term belongs in the task or note the gap for domain-modeling.

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding it.
