// Test component to verify environment variable exposure
'use client'

export default function EnvTest() {
  // This will show what's available to client-side code
  const clientVars = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // Should be undefined
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔍 Client-Side Environment Variables</h2>
      <pre style={{ background: '#f0f0f0', padding: '10px' }}>
        {JSON.stringify(clientVars, null, 2)}
      </pre>
      <p>
        ✅ If <code>serviceKey</code> shows <code>undefined</code>, your service role key is protected!
      </p>
    </div>
  )
}