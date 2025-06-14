// src/components/SupabaseDebug.tsx
'use client'
import { useEffect, useState } from 'react'

export default function SupabaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    const info = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
      keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 
        'NOT SET',
      isClient: typeof window !== 'undefined',
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)
  }, [])

  const testConnection = async () => {
    try {
      setTestResult('Testing...')
      
      // Check if environment variables exist before trying to connect
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setTestResult('❌ Error: Supabase environment variables are not set on the client side')
        return
      }

      // Import dynamically to avoid initialization errors
      const { createSupabaseClient } = await import('@/lib/supabase')
      
      try {
        const supabase = createSupabaseClient()
        
        // Try a simple query (this will fail if table doesn't exist, but that's OK)
        const { error } = await supabase.from('workers').select('count').limit(1)
        
        if (error && error.message.includes('relation "workers" does not exist')) {
          setTestResult('✅ Connection successful! (workers table not created yet)')
        } else if (error) {
          setTestResult('❌ Connection error: ' + error.message)
        } else {
          setTestResult('✅ Connection and query successful!')
        }
      } catch (clientError) {
        setTestResult('❌ Client initialization error: ' + (clientError instanceof Error ? clientError.message : 'Unknown error'))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setTestResult('❌ Error: ' + errorMessage)
    }
  }

  if (!debugInfo) {
    return <div>Loading debug info...</div>
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="font-bold mb-2">Supabase Debug Info</h3>
      <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      
      <div className="mt-2 text-sm">
        <p className="text-red-600 font-semibold">
          Note: If values show "NOT SET", the environment variables are not available on the client side.
        </p>
        <p className="text-gray-600">
          This typically means the app needs to be rebuilt after adding environment variables.
        </p>
      </div>
      
      <button
        onClick={testConnection}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Supabase Connection
      </button>
      
      {testResult && (
        <div className="mt-2 p-2 bg-white rounded">
          {testResult}
        </div>
      )}
    </div>
  )
}