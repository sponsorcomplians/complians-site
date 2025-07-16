"use client";

export default function TestEnvPage() {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_API_KEY:</strong> {apiKey ? `***${apiKey.slice(-4)}` : 'NOT LOADED'}</p>
        <p><strong>API Key Length:</strong> {apiKey?.length || 0}</p>
        <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
      </div>
      
      <button 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={async () => {
          try {
            const response = await fetch('/api/generate-narrative', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey || 'test-public-key-123'
              },
              body: JSON.stringify({
                workerName: 'Test Worker',
                cosReference: 'TEST123',
                assignmentDate: '2023-07-28',
                jobTitle: 'Test Role',
                socCode: '1234'
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              alert('API call successful! Check console for details.');
              console.log('API Response:', data);
            } else {
              const error = await response.text();
              alert(`API call failed: ${response.status} - ${error}`);
            }
          } catch (error) {
            alert(`Error: ${error}`);
          }
        }}
      >
        Test API Call
      </button>
    </div>
  );
} 