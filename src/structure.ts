import { DocumentIcon, ImageIcon, UploadIcon, BulbOutlineIcon } from '@sanity/icons'
import type { StructureResolver } from 'sanity/structure'
import { ImageLibraryUpload } from './components/ImageLibraryUpload'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .icon(DocumentIcon)
        .child(S.documentTypeList('page').title('Pages')),
      S.listItem()
        .title('Lab')
        .icon(BulbOutlineIcon)
        .child(
          S.documentList()
            .title('Lab')
            .filter('_type in ["labOverview", "labBlockPage"]')
        ),
      S.listItem()
        .title('Image Library')
        .icon(ImageIcon)
        .child(
          S.list()
            .title('Image Library')
            .items([
              S.listItem()
                .title('Upload images')
                .icon(UploadIcon)
                .child(S.component(ImageLibraryUpload).id('image-library-upload').title('Upload')),
              S.listItem()
                .title('All images')
                .icon(ImageIcon)
                .child(S.documentTypeList('sanity.imageAsset').title('All images')),
            ])
        ),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() !== 'page' &&
          item.getId() !== 'labBlockPage' &&
          item.getId() !== 'labOverview' &&
          item.getId() !== 'sanity.imageAsset' &&
          item.getId() !== 'sanity.fileAsset'
      ),
    ])
