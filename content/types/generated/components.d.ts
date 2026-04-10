import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCardGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_card_grids';
  info: {
    displayName: 'Card Grid';
    icon: 'grid';
  };
  attributes: {
    appearance: Schema.Attribute.String;
    callToActions: Schema.Attribute.Component<'shared.call-to-action', true>;
    cardSurface: Schema.Attribute.String;
    columns: Schema.Attribute.Integer;
    description: Schema.Attribute.Text;
    emphasis: Schema.Attribute.String;
    interaction: Schema.Attribute.String;
    items: Schema.Attribute.Component<'internals.card-item', true>;
    minimalBackgroundStyle: Schema.Attribute.Boolean;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksCarousel extends Struct.ComponentSchema {
  collectionName: 'components_blocks_carousels';
  info: {
    displayName: 'Carousel';
    icon: 'slideshow';
  };
  attributes: {
    appearance: Schema.Attribute.String;
    callToActions: Schema.Attribute.Component<'shared.call-to-action', true>;
    cardSize: Schema.Attribute.String;
    cardSurface: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    emphasis: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    interaction: Schema.Attribute.String;
    items: Schema.Attribute.Component<'internals.card-item', true>;
    minimalBackgroundStyle: Schema.Attribute.Boolean;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksEditorialBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_editorial_blocks';
  info: {
    displayName: 'Editorial Block';
    icon: 'feather';
  };
  attributes: {
    appearance: Schema.Attribute.String;
    backgroundImagePositionX: Schema.Attribute.String;
    backgroundImagePositionY: Schema.Attribute.String;
    backgroundImageUrl: Schema.Attribute.String;
    body: Schema.Attribute.Text;
    callToActions: Schema.Attribute.Component<'shared.call-to-action', true>;
    ctaLink: Schema.Attribute.String;
    ctaText: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    emphasis: Schema.Attribute.String;
    headline: Schema.Attribute.String;
    headlineSize: Schema.Attribute.String;
    imageArea: Schema.Attribute.String;
    imageFit: Schema.Attribute.String;
    imageUrl: Schema.Attribute.String;
    rows: Schema.Attribute.String;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    textAlign: Schema.Attribute.String;
    textArea: Schema.Attribute.String;
    textInFront: Schema.Attribute.Boolean;
    textVerticalAlign: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

export interface BlocksFullBleedVerticalCarousel
  extends Struct.ComponentSchema {
  collectionName: 'components_blocks_full_bleed_vertical_carousels';
  info: {
    displayName: 'Full Bleed Vertical Carousel';
    icon: 'slideshow';
  };
  attributes: {
    appearance: Schema.Attribute.String;
    callToActions: Schema.Attribute.Component<'shared.call-to-action', true>;
    description: Schema.Attribute.Text;
    emphasis: Schema.Attribute.String;
    items: Schema.Attribute.Component<
      'internals.full-bleed-vertical-carousel-item',
      true
    >;
    minimalBackgroundStyle: Schema.Attribute.Boolean;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heroes';
  info: {
    displayName: 'Hero';
    icon: 'monitor';
  };
  attributes: {
    appearance: Schema.Attribute.String;
    body: Schema.Attribute.Text;
    containerLayout: Schema.Attribute.String;
    contentLayout: Schema.Attribute.String;
    cta2Link: Schema.Attribute.String;
    cta2Text: Schema.Attribute.String;
    ctaLink: Schema.Attribute.String;
    ctaText: Schema.Attribute.String;
    emphasis: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    imageAnchor: Schema.Attribute.String;
    imageUrl: Schema.Attribute.String;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    textAlign: Schema.Attribute.String;
    title: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

export interface BlocksIconGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_icon_grids';
  info: {
    displayName: 'Icon Grid';
    icon: 'grid';
  };
  attributes: {
    appearance: Schema.Attribute.String;
    callToActions: Schema.Attribute.Component<'shared.call-to-action', true>;
    columns: Schema.Attribute.Integer;
    description: Schema.Attribute.Text;
    emphasis: Schema.Attribute.String;
    items: Schema.Attribute.Component<'internals.icon-grid-item', true>;
    minimalBackgroundStyle: Schema.Attribute.Boolean;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface BlocksMediaText5050 extends Struct.ComponentSchema {
  collectionName: 'components_blocks_media_text_5050s';
  info: {
    displayName: 'Media Text 50/50';
    icon: 'layout';
  };
  attributes: {
    accordionItems: Schema.Attribute.Component<
      'internals.media-text-5050-accordion-item',
      true
    >;
    appearance: Schema.Attribute.String;
    blockFramingAlignment: Schema.Attribute.String;
    callToActions: Schema.Attribute.Component<'shared.call-to-action', true>;
    description: Schema.Attribute.Text;
    emphasis: Schema.Attribute.String;
    headingAlignment: Schema.Attribute.String;
    headline: Schema.Attribute.String;
    imageAspectRatio: Schema.Attribute.String;
    imagePosition: Schema.Attribute.String;
    imageUrl: Schema.Attribute.String;
    items: Schema.Attribute.Component<'internals.media-text-5050-item', true>;
    minimalBackgroundStyle: Schema.Attribute.Boolean;
    paragraphColumnLayout: Schema.Attribute.String;
    singleBody: Schema.Attribute.Text;
    singleSubtitle: Schema.Attribute.String;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    variant: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

export interface BlocksMediaTextAsymmetric extends Struct.ComponentSchema {
  collectionName: 'components_blocks_media_text_asymmetrics';
  info: {
    displayName: 'Media Text Asymmetric';
    icon: 'layout';
  };
  attributes: {
    appearance: Schema.Attribute.String;
    blockTitle: Schema.Attribute.String;
    callToActions: Schema.Attribute.Component<'shared.call-to-action', true>;
    description: Schema.Attribute.Text;
    emphasis: Schema.Attribute.String;
    imageAlt: Schema.Attribute.String;
    imageAspectRatio: Schema.Attribute.String;
    imageUrl: Schema.Attribute.String;
    items: Schema.Attribute.Component<
      'internals.media-text-asymmetric-item',
      true
    >;
    longFormParagraphs: Schema.Attribute.Component<
      'internals.media-text-asymmetric-long-form-paragraph',
      true
    >;
    minimalBackgroundStyle: Schema.Attribute.Boolean;
    paragraphLayout: Schema.Attribute.String;
    paragraphRows: Schema.Attribute.Component<
      'internals.media-text-asymmetric-paragraph-row',
      true
    >;
    singleColumnBody: Schema.Attribute.Text;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    variant: Schema.Attribute.String;
  };
}

export interface BlocksMediaTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_media_text_blocks';
  info: {
    displayName: 'Media Text Block';
    icon: 'layout';
  };
  attributes: {
    alignment: Schema.Attribute.String;
    appearance: Schema.Attribute.String;
    body: Schema.Attribute.Text;
    cta2Link: Schema.Attribute.String;
    cta2Text: Schema.Attribute.String;
    ctaLink: Schema.Attribute.String;
    ctaText: Schema.Attribute.String;
    descriptionBody: Schema.Attribute.Text;
    descriptionTitle: Schema.Attribute.String;
    emphasis: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    imageAspectRatio: Schema.Attribute.String;
    imagePosition: Schema.Attribute.String;
    imageUrl: Schema.Attribute.String;
    mediaSize: Schema.Attribute.String;
    minimalBackgroundStyle: Schema.Attribute.Boolean;
    overlayAlignment: Schema.Attribute.String;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    stackAlignment: Schema.Attribute.String;
    stackedMediaWidth: Schema.Attribute.String;
    subhead: Schema.Attribute.String;
    template: Schema.Attribute.String;
    textOnlyAlignment: Schema.Attribute.String;
    title: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

export interface BlocksMediaTextStacked extends Struct.ComponentSchema {
  collectionName: 'components_blocks_media_text_stackeds';
  info: {
    displayName: 'Media Text Stacked';
    icon: 'layout';
  };
  attributes: {
    alignment: Schema.Attribute.String;
    appearance: Schema.Attribute.String;
    body: Schema.Attribute.Text;
    cta2Link: Schema.Attribute.String;
    cta2Text: Schema.Attribute.String;
    ctaLink: Schema.Attribute.String;
    ctaText: Schema.Attribute.String;
    descriptionBody: Schema.Attribute.Text;
    descriptionTitle: Schema.Attribute.String;
    emphasis: Schema.Attribute.String;
    eyebrow: Schema.Attribute.String;
    imageAspectRatio: Schema.Attribute.String;
    imagePosition: Schema.Attribute.String;
    imageUrl: Schema.Attribute.String;
    mediaSize: Schema.Attribute.String;
    minimalBackgroundStyle: Schema.Attribute.Boolean;
    overlayAlignment: Schema.Attribute.String;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    stackAlignment: Schema.Attribute.String;
    stackedMediaWidth: Schema.Attribute.String;
    subhead: Schema.Attribute.String;
    template: Schema.Attribute.String;
    textOnlyAlignment: Schema.Attribute.String;
    title: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

export interface BlocksMediaZoomOutOnScroll extends Struct.ComponentSchema {
  collectionName: 'components_blocks_media_zoom_out_on_scrolls';
  info: {
    displayName: 'Media Zoom Out On Scroll';
    icon: 'zoomOut';
  };
  attributes: {
    alt: Schema.Attribute.String;
    callToActions: Schema.Attribute.Component<'shared.call-to-action', true>;
    description: Schema.Attribute.Text;
    imageUrl: Schema.Attribute.String;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    title: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

export interface BlocksProofPoints extends Struct.ComponentSchema {
  collectionName: 'components_blocks_proof_points';
  info: {
    displayName: 'Proof Points';
    icon: 'check-circle';
  };
  attributes: {
    appearance: Schema.Attribute.String;
    callToActions: Schema.Attribute.Component<'shared.call-to-action', true>;
    description: Schema.Attribute.Text;
    emphasis: Schema.Attribute.String;
    items: Schema.Attribute.Component<'internals.proof-points-item', true>;
    minimalBackgroundStyle: Schema.Attribute.Boolean;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    title: Schema.Attribute.String;
    variant: Schema.Attribute.String;
  };
}

export interface BlocksRotatingMedia extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rotating_medias';
  info: {
    displayName: 'Rotating Media';
    icon: 'picture';
  };
  attributes: {
    appearance: Schema.Attribute.String;
    callToActions: Schema.Attribute.Component<'shared.call-to-action', true>;
    description: Schema.Attribute.Text;
    emphasis: Schema.Attribute.String;
    items: Schema.Attribute.Component<'internals.rotating-media-item', true>;
    minimalBackgroundStyle: Schema.Attribute.Boolean;
    spacingBottom: Schema.Attribute.String;
    spacingTop: Schema.Attribute.String;
    title: Schema.Attribute.String;
    variant: Schema.Attribute.String;
  };
}

export interface InternalsCardItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_card_items';
  info: {
    displayName: 'Card Item';
    icon: 'grid';
  };
  attributes: {
    aspectRatio: Schema.Attribute.String;
    backgroundColor: Schema.Attribute.String;
    cardType: Schema.Attribute.String;
    ctaLink: Schema.Attribute.String;
    ctaText: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    iconImage: Schema.Attribute.String;
    imageUrl: Schema.Attribute.String;
    link: Schema.Attribute.String;
    title: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

export interface InternalsFullBleedVerticalCarouselItem
  extends Struct.ComponentSchema {
  collectionName: 'components_blocks_fbvc_items';
  info: {
    displayName: 'Full Bleed Vertical Carousel Item';
    icon: 'slideshow';
  };
  attributes: {
    description: Schema.Attribute.Text;
    imageUrl: Schema.Attribute.String;
    title: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

export interface InternalsIconGridItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_icon_grid_items';
  info: {
    displayName: 'Icon Grid Item';
    icon: 'grid';
  };
  attributes: {
    accentColor: Schema.Attribute.String;
    body: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    spectrum: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface InternalsMediaText5050AccordionItem
  extends Struct.ComponentSchema {
  collectionName: 'components_blocks_media_text_5050_accordion_items';
  info: {
    displayName: 'Media Text 5050 Accordion Item';
    icon: 'layout';
  };
  attributes: {
    body: Schema.Attribute.Text;
    imageUrl: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    videoUrl: Schema.Attribute.String;
  };
}

export interface InternalsMediaText5050Item extends Struct.ComponentSchema {
  collectionName: 'components_blocks_media_text_5050_items';
  info: {
    displayName: 'Media Text 5050 Item';
    icon: 'layout';
  };
  attributes: {
    body: Schema.Attribute.Text;
    subtitle: Schema.Attribute.String;
  };
}

export interface InternalsMediaTextAsymmetricItem
  extends Struct.ComponentSchema {
  collectionName: 'components_blocks_mta_items';
  info: {
    displayName: 'Media Text Asymmetric Item';
    icon: 'layout';
  };
  attributes: {
    body: Schema.Attribute.Text;
    linkText: Schema.Attribute.String;
    linkUrl: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface InternalsMediaTextAsymmetricLongFormParagraph
  extends Struct.ComponentSchema {
  collectionName: 'components_blocks_mta_long_form_paragraphs';
  info: {
    displayName: 'Long Form Paragraph';
    icon: 'feather';
  };
  attributes: {
    bodyTypography: Schema.Attribute.String;
    text: Schema.Attribute.Text;
  };
}

export interface InternalsMediaTextAsymmetricParagraphRow
  extends Struct.ComponentSchema {
  collectionName: 'components_blocks_mta_paragraph_rows';
  info: {
    displayName: 'Paragraph Row';
    icon: 'feather';
  };
  attributes: {
    body: Schema.Attribute.Text;
    bodyTypography: Schema.Attribute.String;
    linkText: Schema.Attribute.String;
    linkUrl: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface InternalsProofPointsItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_proof_points_items';
  info: {
    displayName: 'Proof Points Item';
    icon: 'check';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface InternalsRotatingMediaItem extends Struct.ComponentSchema {
  collectionName: 'components_blocks_rotating_media_items';
  info: {
    displayName: 'Rotating Media Item';
    icon: 'picture';
  };
  attributes: {
    imageUrl: Schema.Attribute.String;
    label: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SharedCallToAction extends Struct.ComponentSchema {
  collectionName: 'components_shared_call_to_actions';
  info: {
    displayName: 'Call to Action';
    icon: 'cursor';
  };
  attributes: {
    label: Schema.Attribute.String;
    link: Schema.Attribute.String;
    style: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.card-grid': BlocksCardGrid;
      'blocks.carousel': BlocksCarousel;
      'blocks.editorial-block': BlocksEditorialBlock;
      'blocks.full-bleed-vertical-carousel': BlocksFullBleedVerticalCarousel;
      'blocks.hero': BlocksHero;
      'blocks.icon-grid': BlocksIconGrid;
      'blocks.media-text-5050': BlocksMediaText5050;
      'blocks.media-text-asymmetric': BlocksMediaTextAsymmetric;
      'blocks.media-text-block': BlocksMediaTextBlock;
      'blocks.media-text-stacked': BlocksMediaTextStacked;
      'blocks.media-zoom-out-on-scroll': BlocksMediaZoomOutOnScroll;
      'blocks.proof-points': BlocksProofPoints;
      'blocks.rotating-media': BlocksRotatingMedia;
      'internals.card-item': InternalsCardItem;
      'internals.full-bleed-vertical-carousel-item': InternalsFullBleedVerticalCarouselItem;
      'internals.icon-grid-item': InternalsIconGridItem;
      'internals.media-text-5050-accordion-item': InternalsMediaText5050AccordionItem;
      'internals.media-text-5050-item': InternalsMediaText5050Item;
      'internals.media-text-asymmetric-item': InternalsMediaTextAsymmetricItem;
      'internals.media-text-asymmetric-long-form-paragraph': InternalsMediaTextAsymmetricLongFormParagraph;
      'internals.media-text-asymmetric-paragraph-row': InternalsMediaTextAsymmetricParagraphRow;
      'internals.proof-points-item': InternalsProofPointsItem;
      'internals.rotating-media-item': InternalsRotatingMediaItem;
      'shared.call-to-action': SharedCallToAction;
    }
  }
}
