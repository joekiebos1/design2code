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
const S_LAB_CALL_TO_ACTIONS = `callToActions[]{
    _key,
    label,
    link,
    style
  }`
/** 50/50: flat single fields, paragraph items, accordion items with per-panel media. */
const S_MEDIA_TEXT_5050 = `{
    spacingTop,
    spacingBottom,
    headline,
    description,
    ${S_LAB_CALL_TO_ACTIONS},
    variant,
    paragraphColumnLayout,
    singleSubtitle,
    singleBody,
    imagePosition,
    blockFramingAlignment,
    items[]{
      _key,
      subtitle,
      body
    },
    accordionItems[]{
      _key,
      subtitle,
      body,
      "image": coalesce(imageUrl, image.asset->url),
      "video": coalesce(videoUrl, video.asset->url)
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
const S_LAB_CARD_ITEMS = `{
      _type,
      _key,
      cardType,
      title,
      description,
      size,
      backgroundColor,
      "image": coalesce(imageUrl, image.asset->url),
      "video": coalesce(videoUrl, video.asset->url),
      ctaText,
      ctaLink,
      aspectRatio,
      icon,
      "iconImage": iconImage.asset->url,
      callToActionButtons[]{
        _key,
        label,
        link,
        style
      },
      features
    }`
const S_CAROUSEL = `{
    spacingTop,
    spacingBottom,
    spacing,
    title,
    description,
    ${S_LAB_CALL_TO_ACTIONS},
    cardSize,
    emphasis,
    minimalBackgroundStyle,
    surfaceColour,
    items[]{
      cardType,
      title,
      description,
      backgroundColor,
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
    description,
    ${S_LAB_CALL_TO_ACTIONS},
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
    title,
    description,
    ${S_LAB_CALL_TO_ACTIONS},
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
const S_MEDIA_TEXT_ASYMMETRIC = `{
    spacingTop,
    spacingBottom,
    blockTitle,
    description,
    ${S_LAB_CALL_TO_ACTIONS},
    variant,
    paragraphLayout,
    singleColumnBody,
    longFormParagraphs[]{
      _key,
      text,
      bodyTypography
    },
    emphasis,
    minimalBackgroundStyle,
    surfaceColour,
    imageAspectRatio,
    imageAlt,
    "image": coalesce(imageUrl, image.asset->url),
    imageUrl,
    paragraphRows[]{
      _key,
      title,
      body,
      bodyTypography,
      linkText,
      linkUrl
    },
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
    "videoUrl": coalesce(videoUrl, video.asset->url)
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
  _type == "mediaTextAsymmetric" => ${S_MEDIA_TEXT_ASYMMETRIC}
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
  _type == "labMediaText5050" => ${S_MEDIA_TEXT_5050},
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
    description,
    ${S_LAB_CALL_TO_ACTIONS},
    emphasis,
    minimalBackgroundStyle,
    surfaceColour,
    items[]${S_LAB_CARD_ITEMS}
  },
  _type == "labCarousel" => {
    spacingTop,
    spacingBottom,
    spacing,
    title,
    description,
    ${S_LAB_CALL_TO_ACTIONS},
    cardSize,
    emphasis,
    minimalBackgroundStyle,
    surfaceColour,
    items[]${S_LAB_CARD_ITEMS}
  },
  _type == "editorialBlock" => {
    spacingTop,
    spacingBottom,
    rows,
    emphasis,
    surfaceColour,
    textArea,
    headlineSize,
    textAlign,
    textVerticalAlign,
    textInFront,
    headline,
    description,
    ${S_LAB_CALL_TO_ACTIONS},
    body,
    ctaText,
    ctaLink,
    imageArea,
    "backgroundImage": coalesce(backgroundImageUrl, backgroundImage.asset->url),
    backgroundImagePositionX,
    backgroundImagePositionY,
    "image": coalesce(imageUrl, image.asset->url),
    imageUrl,
    videoUrl,
    imageFit
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
    "videoUrl": coalesce(videoUrl, video.asset->url),
    contentLayout,
    containerLayout,
    imageAnchor,
    textAlign,
    emphasis,
    surfaceColour
  },
  _type == "fullBleedVerticalCarousel" => {
    spacingTop,
    spacingBottom,
    emphasis,
    surfaceColour,
    minimalBackgroundStyle,
    title,
    description,
    ${S_LAB_CALL_TO_ACTIONS},
    items[]{
      title,
      description,
      "image": coalesce(imageUrl, image.asset->url),
      "video": coalesce(videoUrl, video.asset->url)
    }
  },
  _type == "rotatingMedia" => {
    spacingTop,
    spacingBottom,
    variant,
    emphasis,
    surfaceColour,
    minimalBackgroundStyle,
    title,
    description,
    ${S_LAB_CALL_TO_ACTIONS},
    items[]{
      "image": coalesce(imageUrl, image.asset->url),
      title,
      label
    }
  },
  _type == "mediaZoomOutOnScroll" => {
    spacingTop,
    spacingBottom,
    title,
    description,
    ${S_LAB_CALL_TO_ACTIONS},
    "image": coalesce(imageUrl, image.asset->url),
    videoUrl,
    alt
  },
  _type == "iconGrid" => ${S_ICON_GRID},
  _type == "proofPoints" => ${S_PROOF_POINTS},
  _type == "mediaTextAsymmetric" => ${S_MEDIA_TEXT_ASYMMETRIC},
  _type == "labMediaTextAsymmetric" => ${S_MEDIA_TEXT_ASYMMETRIC}
}`

/** Lab overview singleton — id must not contain `/` (Sanity structure constraint). */
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

