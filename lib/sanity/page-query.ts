/** Full page query with all block fields for JioKarna and page rendering */
export const fullPageQuery = `*[_type == "page" && _id == $id][0]{
  _id,
  title,
  "slug": slug.current,
  sections[]{
    _type,
    _key,
    _type == "hero" => {
      variant,
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
      "image": coalesce(imageUrl, image.asset->url)
    },
    _type == "cardGrid" => {
      spacingTop,
      spacingBottom,
      spacing,
      columns,
      title,
      titleLevel,
      items[]{
        cardStyle,
        title,
        description,
        "image": coalesce(imageUrl, image.asset->url),
        "video": coalesce(videoUrl, video.asset->url),
        ctaText,
        ctaLink,
        surface
      }
    },
    _type == "mediaTextBlock" => {
      spacingTop,
      spacingBottom,
      spacing,
      size,
      eyebrow,
      subhead,
      title,
      titleLevel,
      body,
      bulletList,
      ctaText,
      ctaLink,
      cta2Text,
      cta2Link,
      "image": coalesce(imageUrl, image.asset->url),
      "video": coalesce(videoUrl, video.asset->url),
      template,
      contentWidth,
      imagePosition,
      align,
      overlayAlignment,
      stackImagePosition,
      stackAlignment,
      imageAspectRatio,
      mediaStyle,
      blockBackground
    },
    _type == "fullBleedVerticalCarousel" => {
      spacingTop,
      spacingBottom,
      spacing,
      items[]{
        title,
        description,
        "image": coalesce(imageUrl, image.asset->url),
        "video": coalesce(videoUrl, video.asset->url)
      }
    },
    _type == "carousel" => {
      spacingTop,
      spacingBottom,
      spacing,
      variant,
      title,
      titleLevel,
      cardSize,
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
      titleLevel,
      items[]{
        title,
        description,
        icon
      }
    },
    _type == "rotatingMedia" => {
      spacingTop,
      spacingBottom,
      spacing,
      variant,
      surface,
      items[]{
        title,
        label,
        "image": coalesce(imageUrl, image.asset->url)
      }
    }
  }
}`
