'use client'

import { useRouter } from 'next/navigation'
import { IntentScreen } from './screens/IntentScreen'
import { useJioKarna } from './JioKarnaContext'

export default function JioKarnaIntentPage() {
  const router = useRouter()
  const { intentData, setIntentData } = useJioKarna()

  return (
    <IntentScreen
      data={intentData}
      onChange={setIntentData}
      onSubmit={() => router.push('/jiokarna/interview')}
    />
  )
}
