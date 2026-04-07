import { defineConfig } from 'sanity'
import { presentationTool } from 'sanity/presentation'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from '@design2code/cms-schema'
import { structure } from '@design2code/cms-schema/structure'
import { resolve } from '@design2code/sanity/presentation'

export default defineConfig({
  name: 'design2code',
  title: 'Design2Code',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure,
    }),
    presentationTool({
      resolve,
      previewUrl: {
        initial: process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000',
        previewMode: {
          enable: '/api/draft-mode/enable',
          disable: '/api/draft-mode/disable',
        },
      },
      allowOrigins: [
        'http://localhost:3000',
        'http://localhost:3333',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3333',
        'http://localhost:*',
        'http://127.0.0.1:*',
      ],
    }),
  ],
  schema: {
    types: schemaTypes,
  },
})
