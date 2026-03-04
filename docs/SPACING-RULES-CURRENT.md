# Spacing rules (target structure implemented)

**xyz** = `SPACING_VAR[spacing]` = block-gap-tight | block-gap | block-gap-chapter (small | medium | large)

---

## Block A (ghost, contained 50/50)

```
Block A starts (BlockContainer div)
├── paddingBlockStart: xyz          ← BlockContainer (between previous block and this block)
├── MediaTextBlock content
│   └── grid div
│       ├── paddingBlock: xyz        ← grid (all sides, internal to block)
│       └── content
Block A ends
```

---

## Block B (ghost, contained 50/50)

Same as Block A.

```
Block B starts
├── paddingBlockStart: xyz          ← BlockContainer
├── grid
│   ├── paddingBlock: xyz           ← grid
│   └── content
Block B ends
```

---

## Block C (with background colour, contained)

```
Block C starts (BlockContainer div)
├── paddingBlockStart: xyz          ← BlockContainer
├── blockBgWrapper
│   └── coloured div (full width)
│       ├── paddingBlock: xyz        ← top internal padding (inside band)
│       ├── content
│       └── paddingBlock: xyz       ← bottom internal padding (inside band)
├── paddingBlockEnd: xyz             ← BlockContainer (below coloured block)
Block C ends
```

**Note:** Spacer div removed for contained blocks; BlockContainer paddingBlockEnd provides the gap.

---

## Block D (with background colour and overflow image)

```
Block D starts (BlockContainer div)
├── (no paddingBlockStart – spacingOnlyOnContent=true)
├── blockBgWrapper
│   └── coloured div (no padding – noPadding=true)
│       └── grid div (no padding)
│           ├── media column
│           └── text column
│               ├── padding: xyz         ← internal padding on text container only
│               └── content
│   └── spacer div (height: xyz)         ← below coloured band (overflow only)
Block D ends
```

**Note:** Internal padding xyz applied to text container only. Spacer below band when overflow (BlockContainer skips padding).

---

## Summary of spacers used

| Location | Block A | Block B | Block C | Block D |
|----------|---------|---------|---------|---------|
| BlockContainer paddingBlockStart | xyz | xyz | xyz | — |
| BlockContainer paddingBlockEnd | — | — | xyz | — |
| blockBgWrapper coloured div paddingBlock | — | — | xyz (top+bottom) | — |
| blockBgWrapper spacer div | — | — | — | xyz (overflow only) |
| grid paddingBlock | xyz | xyz | — | — |
| text column padding | — | — | — | xyz (all sides) |
| overflow spacer (when no bg) | — | — | — | xyz |

---

## Target structure (implemented)

```
Block A: internal padding xyz
Block B: internal padding xyz
Block C (with bg): internal padding xyz inside band (top, content, bottom)
Block D (with bg + overflow): internal padding xyz on text container only
```
