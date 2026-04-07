# DESIGN SYSTEM RULES

All UI uses `@marcelinodzn/ds-react` and `@marcelinodzn/ds-tokens`. No Tailwind. No other UI libraries.

**Use MCP first** for component docs, props, and validation — see `.cursor/rules/ds-mcp.mdc`. Local packages are required at runtime; MCP is the canonical reference.

---

## DsProvider (required at app root)

```tsx
import { DsProvider } from '@marcelinodzn/ds-react'
<DsProvider platform="Desktop (1440)" colorMode="Light" density="Default" theme="MyJio">
  <App />
</DsProvider>
```

---

## SurfaceProvider

Use for elevation. Components are surface-aware.

```tsx
<SurfaceProvider level={0}>
  <Card surface={1}>...</Card>
</SurfaceProvider>
```

### Block emphasis → SurfaceProvider

The content author only chooses block emphasis (ghost, minimal, subtle, bold). Map to SurfaceProvider; DS components adapt automatically—do not set attention/color on typography based on surface.

```
ghost   → level={0} hasBoldBackground={false}   (default)
minimal → level={1} hasBoldBackground={false}
subtle  → level={1} hasBoldBackground={false}
bold    → level={1} hasBoldBackground={true}     (DS inverts text automatically)
```

---

## Token rules

- NEVER hardcode hex, px, or arbitrary colors
- ALWAYS use DS component props (appearance, surface, size) and tokens (`var(--ds-spacing-*)`, `var(--ds-typography-*)`, `var(--ds-color-*)`)
- **Colour priority:** THEME first → MCP DS (`resolve-token`) → `lib/colors/jioColors.json` only when explicitly instructed. When using jioColors: use official labels only (e.g. `reliance.800`, `getPrimaryColor("reliance")`), never hardcoded hex. Prefer DS component props and `var(--ds-color-*)` tokens. Do not reach for jioColors unless the user explicitly requests a specific colour.

---

## Icon usage

- Icons are gray by default. Add `appearance` for color.
- **Use `appearance="secondary"** for brand-colored icons (not primary — primary does not resolve correctly for icons in this theme).
- Use `tinted` for brand tinting on coloured surfaces.
- Use `appearance="positive"` for success/semantic green, `appearance="negative"` for error states.

```tsx
<Icon asset={<IcStar />} size="L" appearance="secondary" attention="high" tinted />
```

---

## DS components (use these, not HTML primitives)

Typography: Display, Headline, Title, Text, Label
Interactive: Button, Chip, Switch, Checkbox, Radio, Select, Input, TextArea, SearchField, Slider, Stepper
Layout: Card, CardHeader, CardBody, CardFooter, Divider, ScrollArea, SurfaceProvider
Navigation: HeaderNavigation, BottomNavigation, Tabs, SegmentedControl, Menu
Feedback: Toast, Dialog, AlertDialog, Popover, Tooltip, Progress, Badge
Media: Image, Avatar, Icon, Logo
Data: StructuredList, ListItem, Accordion, Collapsible, CarouselIndicator
