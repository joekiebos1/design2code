/** Canonical page sections projection. Use for both slug and id queries. */
const PAGE_SECTIONS_PROJECTION = `{
  _type,
  _key,
  _type == "hero" => {
    contentLayout,
    containerLayout,
    imageAnchor,
    textAlign,
    "blockSurface": coalesce(blockSurface, "minimal"),
    "blockAccent": coalesce(blockAccent, "primary"),
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
    surface,
    minimalBackgroundStyle,
    blockAccent,
    items[]{
      _type,
      _key,
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
    blockBackground,
    minimalBackgroundStyle,
    blockAccent
  },
  _type == "mediaTextBlock" => {
    spacingTop,
    spacingBottom,
    spacing,
    eyebrow,
    subhead,
    title,
    body,
    bulletList,
    ctaText,
    ctaLink,
    cta2Text,
    cta2Link,
    "image": coalesce(imageUrl, image.asset->url),
    "video": coalesce(videoUrl, video.asset->url),
    template,
    imagePosition,
    overlayAlignment,
    textOnlyAlignment,
    stackImagePosition,
    stackAlignment,
    mediaSize,
    stackedMediaWidth,
    imageAspectRatio,
    blockBackground,
    minimalBackgroundStyle,
    blockAccent
  },
  _type == "carousel" => {
    spacingTop,
    spacingBottom,
    spacing,
    title,
    cardSize,
    surface,
    minimalBackgroundStyle,
    blockAccent,
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
    surface,
    minimalBackgroundStyle,
    blockAccent,
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
    blockSurface,
    blockAccent,
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
    blockSurface,
    minimalBackgroundStyle,
    blockAccent,
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
  _type == "mediaTextBlock" => {
    spacingTop,
    spacingBottom,
    spacing,
    eyebrow,
    subhead,
    title,
    body,
    bulletList,
    ctaText,
    ctaLink,
    cta2Text,
    cta2Link,
    "image": coalesce(imageUrl, image.asset->url),
    "video": coalesce(videoUrl, video.asset->url),
    template,
    imagePosition,
    overlayAlignment,
    textOnlyAlignment,
    stackImagePosition,
    stackAlignment,
    mediaSize,
    stackedMediaWidth,
    imageAspectRatio,
    blockBackground,
    minimalBackgroundStyle,
    blockAccent
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
    blockBackground,
    minimalBackgroundStyle,
    blockAccent
  },
  _type == "cardGrid" => {
    spacingTop,
    spacingBottom,
    spacing,
    columns,
    title,
    surface,
    minimalBackgroundStyle,
    blockAccent,
    items[]{
      _type,
      _key,
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
    surface,
    minimalBackgroundStyle,
    blockAccent,
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
    overlayHeight,
    containerLayout,
    imageAnchor,
    textAlign,
    "blockSurface": coalesce(blockSurface, "minimal"),
    "blockAccent": coalesce(blockAccent, "primary")
  },
  _type == "labGridBlockCard" => {
    columns,
    sectionTitle,
    blockSurface,
    blockAccent,
    cards[]{
      backgroundColor,
      icon,
      "iconImage": iconImage.asset->url,
      title,
      description,
      callToActionButtons[]{
        label,
        link,
        style
      },
      features
    }
  },
  _type == "fullBleedVerticalCarousel" => {
    surface,
    blockAccent,
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
    surface,
    blockAccent,
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
    columns
  },
  _type == "proofPoints" => {
    title,
    variant,
    surface,
    minimalBackgroundStyle,
    blockAccent,
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
    blockSurface,
    minimalBackgroundStyle,
    blockAccent,
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
