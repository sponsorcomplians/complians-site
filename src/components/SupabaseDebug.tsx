// src/components/SupabaseDebug.tsx
'use client'
import { useEffect, useState } from 'react'

export default function SupabaseDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    const info = {
      url: 'Check via API',
      keyExists: 'Check via API',
      isClient: typeof window !== 'undefined',
      timestamp: new Date().toISOString()
    }
    setDebugInfo(info)
  }, [])

  const testConnection = async () => {
    try {
      setTestResult('Testing...')
      
      // Use API endpoint to check environment
      const response = await fetch('/api/check-env')
      const data = await response.json()
      
      if (response.ok) {
        setTestResult(`✅ Server environment check passed. Supabase URL: ${data.env.NEXT_PUBLIC_SUPABASE_URL}`)
      } else {
        setTestResult('❌ Failed to check environment')
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
        <p className="text-gray-600">
          Client-side environment variables are not directly accessible.
          Use the button below to check server-side configuration.
        </p>
      </div>
      
      <button
        onClick={testConnection}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Server Configuration
      </button>
      
      {testResult && (
        <div className="mt-2 p-2 bg-white rounded">
          {testResult}
        </div>
      )}
    </div>
  )
}