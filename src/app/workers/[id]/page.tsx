'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import WorkerProfileList from '@/components/WorkerProfileList'

export default function WorkersPage() {
  const router = useRouter()
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sponsor Licence Compliance</h1>
        <button 
          onClick={() => router.push('/workers/new')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Worker
        </button>
      </div>
      
      <div className="mb-8">
        <div className="flex border-b">
          <button className="px-4 py-2 border-b-2 border-blue-600 font-medium text-blue-600">
            Workers
          </button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
            Documents
          </button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
            Calendar
          </button>
          <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
            Dashboard
          </button>
        </div>
      </div>
      
      <WorkerProfileList />
    </div>
  )
}
