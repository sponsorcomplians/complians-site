'use client'

export default function WorkersPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Workers</h1>
      
      <div className="mb-6">
        <a 
          href="/workers/new" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add New Worker
        </a>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-600">Workers listing will go here.</p>
      </div>
    </div>
  )
}