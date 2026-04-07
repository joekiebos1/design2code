/**
 * JSON schema for PageBrief structured output.
 * Used with Anthropic output_config to guarantee valid JSON.
 * Must comply with Anthropic schema limitations: additionalProperties: false, no $ref, etc.
 */
export const PAGE_BRIEF_SCHEMA = {
  type: 'object' as const,
  properties: {
    meta: {
      type: 'object',
      properties: {
        pageName: { type: 'string' },
        pageType: { type: 'string' },
        slug: { type: 'string' },
        intent: { type: 'string' },
        audience: { type: 'string' },
        primaryAction: { type: 'string' },
        keyMessage: { type: 'string' },
      },
      required: ['pageName', 'pageType', 'slug', 'intent', 'audience', 'primaryAction', 'keyMessage'],
      additionalProperties: false,
    },
    ia: {
      type: 'object',
      properties: {
        proposedPath: { type: 'string' },
        parentSection: { type: 'string' },
        relatedPages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              path: { type: 'string' },
              relationship: { type: 'string' },
            },
            required: ['title', 'path', 'relationship'],
            additionalProperties: false,
          },
        },
        existingConflicts: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['proposedPath', 'parentSection', 'relatedPages', 'existingConflicts'],
      additionalProperties: false,
    },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          order: { type: 'integer' },
          sectionName: { type: 'string' },
          component: { type: 'string' },
          rationale: { type: 'string' },
          narrativeRole: { type: 'string' },
          contentSlots: {
            type: 'object',
            properties: {
              headline: { type: ['string', 'null'] },
              subhead: { type: ['string', 'null'] },
              body: { type: ['string', 'null'] },
              cta: {
                type: ['object', 'null'],
                properties: {
                  label: { type: ['string', 'null'] },
                  destination: { type: ['string', 'null'] },
                  rationale: { type: ['string', 'null'] },
                },
                additionalProperties: false,
              },
              mediaType: { type: ['string', 'null'] },
              items: { type: ['array', 'null'] },
            },
            additionalProperties: false,
          },
          blockOptions: {
            type: ['object', 'null'],
            properties: {
              emphasis: { type: ['string', 'null'] },
              surfaceColour: { type: ['string', 'null'] },
              variant: { type: ['string', 'null'] },
              size: { type: ['string', 'null'] },
              template: { type: ['string', 'null'] },
              cardSize: { type: ['string', 'null'] },
              columns: { type: ['integer', 'null'] },
            },
            additionalProperties: false,
          },
          crossLinks: {
            type: ['array', 'null'],
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                destination: { type: 'string' },
                rationale: { type: 'string' },
              },
              required: ['label', 'destination', 'rationale'],
              additionalProperties: false,
            },
          },
          flags: {
            type: 'array',
            items: { type: 'string' },
          },
          imageBrief: { type: ['string', 'null'] },
          imageIntent: { type: ['string', 'null'] },
        },
        required: ['order', 'sectionName', 'component', 'rationale', 'narrativeRole', 'contentSlots', 'flags'],
        additionalProperties: false,
      },
    },
    launchChecklist: {
      type: 'array',
      items: { type: 'string' },
    },
    status: { type: 'string' },
    createdAt: { type: 'string' },
    version: { type: 'integer' },
  },
  required: ['meta', 'ia', 'sections', 'launchChecklist', 'status', 'createdAt', 'version'],
  additionalProperties: false,
}
