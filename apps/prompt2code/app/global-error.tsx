'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{ padding: 40, fontFamily: 'monospace', fontSize: 14 }}>
          <strong>Something went wrong.</strong>
          <pre style={{ marginTop: 16, color: '#c00' }}>{error.message}</pre>
          <button onClick={reset} style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
