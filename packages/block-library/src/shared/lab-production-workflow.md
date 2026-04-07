# Lab ↔ production block workflow

Paths below are from the **repository root**. Lab and production blocks live in **`packages/block-library`**. The dotcom app mounts lab at **`/lab`** (`apps/dotcom/app/lab/**`).

## Principles

- **Lab blocks** live under **`packages/block-library/src/lab/**`** with a **`Lab*` export name**. They are **forks**: their implementation does **not** re-export or wrap the production block component (`packages/block-library/src/production/**/BlockName.tsx`).
- **Exception — Hero:** After promote, `LabHeroBlock` may re-export production `HeroBlock` until the next lab experiment. For **lab-only** Hero work, fork again (full `LabHeroBlock` in the lab file); do not edit production `HeroBlock.tsx` unless promoting or the user asks for production changes. See `.cursor/rules/cursorrules.mdc` (Hero subsection).
- **Shared infrastructure** stays single-source. Lab may import from:
  - `packages/block-library/src/components/blocks/**` (Grid, VideoWithControls, StreamImage, Cards, …)
  - `packages/block-library/src/production/WidthCap.tsx`, `BlockReveal.tsx`, `BlockShell.tsx`, and other layout helpers listed in `.cursor/rules/agent-roles.mdc`
  - `packages/block-library/src/shared/**`, `@design2code/ds`, DS packages
- **Types** for a paired lab/production block may import from production `*.types.ts` until a shared `packages/block-library/src/shared/*-shared.types.ts` exists, or types are duplicated intentionally after a fork.

## While developing

Edit **only** the lab block file (and lab-only components under **`packages/block-library/src/lab/**`** or **`apps/dotcom/app/lab/components/**`**) until you ask to promote. Do not change production **`packages/block-library/src/production/**`** for that experiment.

## Promote (merge lab → production)

When the lab behaviour should ship:

1. **Blocks-agent:** Copy the **lab** implementation into **`packages/block-library/src/production/<BlockFolder>/`** (replace or merge the production component). Fix import paths. Register exports in **`packages/block-library/src/production/index.ts`** if needed.
2. **Sync lab to match production:** After promotion, **production and lab must show the same UI** for that block. Either:
   - **Copy back:** Paste the updated production component into the lab file again (adjust paths and `Lab*` name), or
   - **Document** that the next lab session starts from a fresh copy of production.
3. **Content-agent** (if CMS contract changed): schema in **`packages/cms-schema`**, GROQ in **`packages/sanity`**, **`BlockRenderer`** / **`LabBlockRenderer`**, seeds in **`apps/dotcom/scripts`**.

Lab **keeps** its `Lab*` component path for the next experiment; it is not deleted on promote.

## Reset lab (abandon experiment)

When the lab version should match **stable production** again:

1. Copy **`packages/block-library/src/production/.../ProductionBlock.tsx`** into **`packages/block-library/src/lab/.../LabBlock.tsx`** (overwrite).
2. Rename the exported function to **`Lab…`**, fix imports for the lab folder depth, and restore any lab-only paths (e.g. `LabBlockFramingCallToActions` from **`packages/block-library/src/components`** or **`apps/dotcom/app/lab/components`**).
3. Re-apply any **intentional** lab-only deltas (tokens, spacing) if you still want them; otherwise the lab block now mirrors production.

## Automation

There is no required script; use **diff/merge in the editor** or add a small helper under **`apps/dotcom/scripts/`** later if you want `--from-prod` / `--from-lab` sync helpers.
