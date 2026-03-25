'use client'

import { useMemo } from 'react'
import type { StringInputProps } from 'sanity'
import { useFormValue } from 'sanity'
import { labCardAspectRatioListForPath } from '../../schemaTypes/shared/labCarouselCardContext'

/**
 * Aspect ratio options depend on parent block: lab carousel size vs lab card grid.
 */
export function LabCardAspectRatioInput(props: StringInputProps) {
  const document = useFormValue([]) as Parameters<typeof labCardAspectRatioListForPath>[0]
  const { path, schemaType, renderDefault } = props

  const list = useMemo(() => labCardAspectRatioListForPath(document, path), [document, path])

  const schemaTypePatched = useMemo(
    () => ({
      ...schemaType,
      options: { ...schemaType.options, list },
    }),
    [schemaType, list],
  )

  return renderDefault({ ...props, schemaType: schemaTypePatched })
}
