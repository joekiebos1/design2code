'use client'

import { useRouter } from 'next/navigation'
import { PreviewScreen } from '../screens/PreviewScreen'
import { useJioKarna } from '../JioKarnaContext'

export default function JioKarnaPreviewPage() {
  const router = useRouter()
  const { brief, previewImageSource, setApprovedBrief } = useJioKarna()

  if (!brief) {
    router.replace('/jiokarna/structure')
    return null
  }

  return (
    <PreviewScreen
      brief={brief}
      imageSource={previewImageSource}
      onApprove={() => {
        setApprovedBrief({ ...brief, status: 'approved' })
        router.push('/jiokarna/approved')
      }}
      onBack={() => router.push('/jiokarna/structure')}
    />
  )
}
