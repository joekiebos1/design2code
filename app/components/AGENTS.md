# Components by project

```
app/components/
├── blocks/     → blocks-agent (Grid, VideoWithControls, StreamImage, Cards)
├── content/    → content-agent (BlockRenderer — Sanity → block props mapping)
├── studio/     → studio-agent (storytelling-inspiration)
└── shared/     → app-level (Providers, StickyNav)

src/components/
└── sanity/     → content-agent (Sanity inputs: ColorPickerInput, IconPickerInput, etc.)
```

Invoke `/content-agent`, `/blocks-agent`, or `/studio-agent` accordingly.
