// components/SupabaseDebug.tsx
'use client'
import { useEffect, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export default function SupabaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    const info = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      keyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
      isClient: typeof window !== 'undefined',
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)
  }, [])

  const testConnection = async () => {
    try {
      setTestResult('Testing...')
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
      <pre className="text-sm bg-white p-2 rounded">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      
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