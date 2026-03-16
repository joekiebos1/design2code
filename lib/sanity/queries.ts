/** Shared section projections — compose PAGE and LAB from these. */
const S_MEDIA_TEXT_BLOCK = `{
    spacingTop,
    spacingBottom,
    spacing,
    eyebrow,
    subhead,
    title,
    body,
    ctaText,
    ctaLink,
    cta2Text,
    cta2Link,
    "image": coalesce(imageUrl, image.asset->url),
    "video": coalesce(videoUrl, video.asset->url),
    template,
    imagePosition,
    alignment,
    overlayAlignment,
    textOnlyAlignment,
    stackAlignment,
    mediaSize,
    descriptionTitle,
    descriptionBody,
    stackedMediaWidth,
    imageAspectRatio,
    emphasis,
    minimalBackgroundStyle,
    surfaceColour
  }`
const S_MEDIA_TEXT_STACKED = `{
    spacingTop,
    spacingBottom,
    spacing,
    eyebrow,
    subhead,
    title,
    body,
    ctaText,
    ctaLink,
    cta2Text,
    cta2Link,
    "image": coalesce(imageUrl, image.asset->url),
    "video": coalesce(videoUrl, video.asset->url),
    template,
    imagePosition,
    alignment,
    overlayAlignment,
    textOnlyAlignment,
    stackAlignment,
    mediaSize,
    descriptionTitle,
    descriptionBody,
    stackedMediaWidth,
    imageAspectRatio,
    emphasis,
    minimalBackgroundStyle,
    surfaceColour
  }`
const S_MEDIA_TEXT_5050 = `{
    spacingTop,
    spacingBottom,
    headline,
    variant,
    imagePosition,
    items[]{
      subtitle,
      body
    },
    "image": coalesce(imageUrl, image.asset->url),
    "video": coalesce(videoUrl, video.asset->url),
    imageAspectRatio,
    emphasis,
    minimalBackgroundStyle,
    surfaceColour
  }`
const S_CARD_GRID_ITEMS = `{
      _type,
      _key,
      cardType,
      cardStyle,
      title,
      description,
      "image": coalesce(imageUrl, image.asset->url),
      "video": coalesce(videoUrl, video.asset->url),
      ctaText,
      ctaLink,
      size,
      icon,
      "iconImage": iconImage.asset->url,
      callToActionButtons[]{
        _key,
        label,
        link,
        style
      },
      features,
      backgroundColor
    }`
const S_CAROUSEL = `{
    spacingTop,
    spacingBottom,
    spacing,
    title,
    cardSize,
    emphasis,
    minimalBackgroundStyle,
    surfaceColour,
    items[]{
      cardType,
      title,
      description,
      "image": coalesce(imageUrl, image.asset->url),
      "video": coalesce(videoUrl, video.asset->url),
      link,
      ctaText,
      aspectRatio
    }
  }`
const S_PROOF_POINTS = `{
    spacingTop,
    spacingBottom,
    spacing,
    title,
    variant,
    emphasis,
    minimalBackgroundStyle,
    surfaceColour,
    items[]{
      title,
      description,
      icon
    }
  }`
const S_ICON_GRID = `{
    spacingTop,
    spacingBottom,
    spacing,
    emphasis,
    surfaceColour,
    minimalBackgroundStyle,
    columns,
    items[]{
      title,
      body,
      icon,
      accentColor,
      spectrum
    }
  }`
const S_LIST = `{
    spacingTop,
    spacingBottom,
    blockTitle,
    listVariant,
    emphasis,
    minimalBackgroundStyle,
    surfaceColour,
    items[]{
      title,
      body,
      linkText,
      linkUrl,
      subtitle
    }
  }`

/** Canonical page sections projection. Use for both slug and id queries. */
const PAGE_SECTIONS_PROJECTION = `{
  _type,
  _key,
  _type == "hero" => {
    contentLayout,
    containerLayout,
    imageAnchor,
    textAlign,
    emphasis,
    surfaceColour,
    spacingTop,
    spacingBottom,
    spacing,
    productName,
    headline,
    subheadline,
    ctaText,
    ctaLink,
    cta2Text,
    cta2Link,
    "image": coalesce(imageUrl, image.asset->url),
    videoUrl
  },
  _type == "cardGrid" => {
    spacingTop,
    spacingBottom,
    spacing,
    columns,
    title,
    emphasis,
    minimalBackgroundStyle,
    surfaceColour,
    items[]${S_CARD_GRID_ITEMS}
  },
  _type == "mediaText5050" => ${S_MEDIA_TEXT_5050},
  _type == "mediaTextStacked" => ${S_MEDIA_TEXT_STACKED},
  _type == "mediaTextBlock" => ${S_MEDIA_TEXT_BLOCK},
  _type == "carousel" => ${S_CAROUSEL},
  _type == "proofPoints" => ${S_PROOF_POINTS},
  _type == "iconGrid" => ${S_ICON_GRID},
  _type == "list" => ${S_LIST}
}`

export const pageBySlugQuery = `*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  sections[]${PAGE_SECTIONS_PROJECTION}
}`

export const pageByIdQuery = `*[_type == "page" && _id == $id][0]{
  _id,
  title,
  "slug": slug.current,
  sections[]${PAGE_SECTIONS_PROJECTION}
}`

export const allPagesQuery = `*[_type == "page"]{
  _id,
  title,
  "slug": slug.current
}`

const LAB_SECTIONS_PROJECTION = `{
  _type,
  _key,
  _type == "mediaTextStacked" => ${S_MEDIA_TEXT_STACKED},
  _type == "mediaTextBlock" => ${S_MEDIA_TEXT_BLOCK},
  _type == "mediaText5050" => ${S_MEDIA_TEXT_5050},
  _type == "cardGrid" => {
    spacingTop,
    spacingBottom,
    spacing,
    columns,
    title,
    emphasis,
    minimalBackgroundStyle,
    surfaceColour,
    items[]${S_CARD_GRID_ITEMS}
  },
  _type == "labCardGrid" => {
    spacingTop,
    spacingBottom,
    spacing,
    columns,
    title,
    emphasis,
    minimalBackgroundStyle,
    surfaceColour,
    items[]${S_CARD_GRID_ITEMS}
  },
  _type == "carousel" => ${S_CAROUSEL},
  _type == "hero" => {
    productName,
    headline,
    subheadline,
    ctaText,
    ctaLink,
    cta2Text,
    cta2Link,
    "image": coalesce(imageUrl, image.asset->url),
    videoUrl,
    contentLayout,
    containerLayout,
    imageAnchor,
    textAlign,
    emphasis,
    surfaceColour
  },
  _type == "fullBleedVerticalCarousel" => {
    emphasis,
    surfaceColour,
    minimalBackgroundStyle,
    items[]{
      title,
      description,
      "image": coalesce(imageUrl, image.asset->url),
      "video": coalesce(videoUrl, video.asset->url)
    }
  },
  _type == "rotatingMedia" => {
    variant,
    emphasis,
    surfaceColour,
    minimalBackgroundStyle,
    items[]{
      "image": coalesce(imageUrl, image.asset->url),
      title,
      label
    }
  },
  _type == "mediaZoomOutOnScroll" => {
    "image": coalesce(imageUrl, image.asset->url),
    videoUrl,
    alt
  },
  _type == "iconGrid" => ${S_ICON_GRID},
  _type == "proofPoints" => ${S_PROOF_POINTS},
  _type == "list" => ${S_LIST}
}`

export const labOverviewQuery = `*[_type == "labOverview" && _id == "labOverview"][0]{
  _id,
  sections[]${LAB_SECTIONS_PROJECTION}
}`

export const allLabBlockPagesQuery = `*[_type == "labBlockPage"] | order(slug asc){
  _id,
  slug,
  title
}`

export const labBlockPageBySlugQuery = `*[_type == "labBlockPage" && slug == $slug][0]{
  _id,
  slug,
  title,
  sections[]${LAB_SECTIONS_PROJECTION}
}`
