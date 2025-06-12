export default function ReportsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">10-Day Reporting Duties</h1>
      <p className="text-gray-600 mb-8">Track and manage Home Office reporting requirements</p>
      
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Compliance Status</h2>
        <p className="text-gray-600">No reporting duties currently pending.</p>
        <p className="text-sm text-gray-500 mt-4">System operational.</p>
      </div>
    </div>
  );
}
