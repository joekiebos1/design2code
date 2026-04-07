import { defineArrayMember, defineType } from 'sanity'

export const pageBuilderType = defineType({
  name: 'pageBuilder',
  type: 'array',
  title: 'Page sections',
  of: [
    defineArrayMember({ type: 'hero' }),
    defineArrayMember({ type: 'mediaTextStacked' }),
    defineArrayMember({ type: 'mediaText5050' }),
    defineArrayMember({ type: 'cardGrid' }),
    defineArrayMember({ type: 'carousel' }),
    defineArrayMember({ type: 'proofPoints' }),
    defineArrayMember({ type: 'iconGrid' }),
    defineArrayMember({ type: 'mediaTextAsymmetric' }),
  ],
})
