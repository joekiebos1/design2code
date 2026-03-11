'use client'

import { useRouter } from 'next/navigation'
import { ApprovedScreen } from '../screens/ApprovedScreen'
import { useJioKarna } from '../JioKarnaContext'

export default function JioKarnaApprovedPage() {
  const router = useRouter()
  const { approvedBrief } = useJioKarna()

  if (!approvedBrief) {
    router.replace('/jiokarna')
    return null
  }

  return (
    <ApprovedScreen
      brief={approvedBrief}
      onStartOver={() => router.push('/jiokarna')}
    />
  )
}
