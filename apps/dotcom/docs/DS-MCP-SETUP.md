# Jio Design System — MCP vs Local Packages

## Overview

- **MCP (jio-design-system-remote)** — Canonical, maintained reference. Use for docs, validation, component lookup.
- **Local packages** — Required for runtime and build. Cannot be replaced by MCP.

## What Uses MCP

| Use case | MCP tool | When |
|----------|----------|------|
| Component props, examples | `get-component-code` | Before writing new blocks/components |
| Package info | `get-package-info` | When checking available components |
| Platform support | `check-platform` | When adding web/native components |
| Hardcoded value check | `validate-token-usage` | After writing component code |
| Icon search | `search-icons` | When picking icons |

## What Must Stay Local

| Package | Used by | Why |
|---------|---------|-----|
| `@marcelinodzn/ds-react` | All blocks, JioKarna, Providers | React components (Button, Card, etc.) |
| `@marcelinodzn/ds-tokens` | `generate-ds-tokens-css.mjs` | Build-time token → CSS generation |
| `@marcelinodzn/ds-tokens` | `use-grid-breakpoint.ts` | Runtime grid/margin resolution |
| `@marcelinodzn/ds-tokens` | BlockReveal, CarouselBlock, etc. | Motion tokens (createTransition, etc.) |
| `@marcelinodzn/ds-react/icons` | proof-point-icons, CarouselBlock | Icon components |

## MCP Limitations

- **resolve-token** — Returns "Token not found" for all tokens. Token resolution must use local `ds-tokens`.
- **search-icons** / **list-icon-categories** — May return empty. Fall back to `src/lib/ds-icon-names.json` (from `generate:icons`).

## Cursor Rules

See `.cursor/rules/ds-mcp.mdc` for the rule that instructs the AI to use MCP first for DS reference.
