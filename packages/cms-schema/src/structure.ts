import {
  DocumentIcon,
  ImageIcon,
  UploadIcon,
  BulbOutlineIcon,
  ImagesIcon,
  VideoIcon,
  ComponentIcon,
  StarIcon,
} from '@sanity/icons'
import type { StructureResolver } from 'sanity/structure'
import { MediaLibraryUpload } from './components/sanity/MediaLibraryUpload'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Pages')
        .icon(DocumentIcon)
        .child(S.documentTypeList('page').title('Pages')),
      S.listItem()
        .title('Figma2Code')
        .icon(ComponentIcon)
        .child(S.documentTypeList('figmaDesign').title('Figma2Code')),
      S.listItem()
        .title('Lab')
        .icon(BulbOutlineIcon)
        .child(
          S.list()
            .title('Lab')
            .items([
              S.listItem()
                .title('Homepage')
                .icon(DocumentIcon)
                .child(
                  S.document()
                    .schemaType('labOverview')
                    .documentId('labOverview')
                    .title('Homepage (/lab)'),
                ),
              S.listItem()
                .title('Block pages')
                .icon(DocumentIcon)
                .child(S.documentTypeList('labBlockPage').title('Lab block pages')),
            ]),
        ),
      S.listItem()
        .title('Media Library')
        .icon(ImagesIcon)
        .child(
          S.list()
            .title('Media Library')
            .items([
              S.listItem()
                .title('Upload media')
                .icon(UploadIcon)
                .child(S.component(MediaLibraryUpload).id('media-library-upload').title('Upload')),
              S.listItem()
                .title('All images')
                .icon(ImageIcon)
                .child(S.documentTypeList('sanity.imageAsset').title('All images')),
              S.listItem()
                .title('All videos')
                .icon(VideoIcon)
                .child(
                  S.documentList()
                    .id('sanity-file-assets-video')
                    .title('All videos')
                    .filter('_type == "sanity.fileAsset" && mimeType match "video*"')
                    .apiVersion('2024-01-01'),
                ),
            ]),
        ),
      S.listItem()
        .title('Inspiration')
        .icon(StarIcon)
        .child(
          S.list()
            .title('Inspiration')
            .items([
              S.listItem()
                .title('Benchmarks')
                .icon(StarIcon)
                .child(
                  S.documentList()
                    .id('studio-inspiration-benchmarks')
                    .title('Benchmarks')
                    .filter('_type == "studioInspiration" && inspirationType == "benchmark"')
                    .apiVersion('2024-01-01'),
                ),
              S.listItem()
                .title('Jio Designs')
                .icon(StarIcon)
                .child(
                  S.documentList()
                    .id('studio-inspiration-jio-designs')
                    .title('Jio Designs')
                    .filter('_type == "studioInspiration" && inspirationType == "jioDesign"')
                    .apiVersion('2024-01-01'),
                ),
            ]),
        ),
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() !== 'page' &&
          item.getId() !== 'figmaDesign' &&
          item.getId() !== 'labBlockPage' &&
          item.getId() !== 'labOverview' &&
          item.getId() !== 'sanity.imageAsset' &&
          item.getId() !== 'sanity.fileAsset' &&
          item.getId() !== 'studioInspiration',
      ),
    ])
