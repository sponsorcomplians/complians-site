// src/app/test/page.tsx
export default function TestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>This page works without any Supabase dependencies.</p>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Quick Links:</h2>
        <ul className="list-disc list-inside space-y-2">
          <li><a href="/api/check-env" className="text-blue-600 hover:underline">Check Environment Variables (API)</a></li>
          <li><a href="/workers" className="text-blue-600 hover:underline">Workers Page</a></li>
          <li><a href="/dashboard" className="text-blue-600 hover:underline">Dashboard</a></li>
        </ul>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p className="text-sm">
          Environment check (build time):<br />
          NODE_ENV: {process.env.NODE_ENV || 'not set'}<br />
          Has Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Yes' : 'No'}<br />
          Has Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
}
export default function TestPage() {
  return <div>Test Page - No Errors</div>;
}