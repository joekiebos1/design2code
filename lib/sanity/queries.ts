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
    items[]{
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
    }
  },
  _type == "mediaText5050" => {
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
  },
  _type == "mediaTextStacked" => {
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
  },
  _type == "mediaTextBlock" => {
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
  },
  _type == "carousel" => {
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
  },
  _type == "proofPoints" => {
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
  },
  _type == "iconGrid" => {
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
  },
  _type == "list" => {
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
  }
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
  _type == "mediaTextStacked" => {
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
  },
  _type == "mediaTextBlock" => {
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
  },
  _type == "mediaText5050" => {
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
    items[]{
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
    }
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
    items[]{
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
    }
  },
  _type == "carousel" => {
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
  },
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
  _type == "iconGrid" => {
    items[]{
      title,
      body,
      icon,
      accentColor,
      spectrum
    },
    emphasis,
    surfaceColour,
    minimalBackgroundStyle,
    columns
  },
  _type == "proofPoints" => {
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
  },
  _type == "list" => {
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
  }
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
