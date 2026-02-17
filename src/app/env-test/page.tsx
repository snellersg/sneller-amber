'use client'

import EnvTest from '@/components/EnvTest'

export default function EnvTestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <EnvTest />
      <div style={{ marginTop: '20px', padding: '10px', background: '#e8f4fd', borderLeft: '4px solid #2196f3' }}>
        <h3>📝 How to Test:</h3>
        <ol>
          <li>Check this page shows <code>serviceKey: undefined</code></li>
          <li>Open browser DevTools (F12)</li>
          <li>Go to <strong>Sources</strong> → <strong>webpack://</strong> → <strong>.env.local</strong></li>
          <li>If you can't see the service key there, it's protected!</li>
        </ol>
      </div>
    </div>
  )
}