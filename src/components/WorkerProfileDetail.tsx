'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import DocumentUploadForm from '@/components/DocumentUploadForm'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()

interface Worker {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  passport_number: string;
  email: string;
  phone: string;
}

interface ImmigrationStatus {
  id: string;
  worker_id: string;
  visa_type: string;
  visa_number: string;
  start_date: string;
  expiry_date: string;
  brp_number: string;
  cos_reference: string;
  status: string;
}

interface WorkerDocument {
  id: string;
  worker_id: string;
  category_id: string; // Added category_id
  category_name: string; // Assuming we get the name directly for display
  file_name: string;
  file_url: string;
  uploaded_at: string;
  expiry_date?: string;
  is_verified: boolean;
}

export default function WorkerProfileDetail() {
  const router = useRouter()
  const params = useParams()
  const workerId = params.id as string

  const [worker, setWorker] = useState<Worker | null>(null)
  const [immigrationStatus, setImmigrationStatus] = useState<ImmigrationStatus | null>(null)
  const [documents, setDocuments] = useState<WorkerDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWorkerData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch worker profile
      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .select('*')
        .eq('id', workerId)
        .single()

      if (workerError) throw workerError
      setWorker(workerData)

      // Fetch immigration status
      const { data: immigrationData, error: immigrationError } = await supabase
        .from('immigration_status')
        .select('*')
        .eq('worker_id', workerId)
        .single()

      if (immigrationError && immigrationError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw immigrationError
      }
      setImmigrationStatus(immigrationData)

      // Fetch worker documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('worker_documents')
        .select(`
          id,
          worker_id,
          category_id,
          file_name,
          file_url,
          uploaded_at,
          expiry_date,
          is_verified,
          document_categories(name)
        `)
        .eq('worker_id', workerId)

      if (documentsError) throw documentsError
      
      // Map the data to include category_name directly
      const formattedDocuments: WorkerDocument[] = documentsData.map((doc: any) => ({
        id: doc.id,
        worker_id: doc.worker_id,
        category_id: doc.category_id,
        file_name: doc.file_name,
        file_url: doc.file_url,
        uploaded_at: doc.uploaded_at,
        expiry_date: doc.expiry_date,
        is_verified: doc.is_verified,
        category_name: doc.document_categories ? doc.document_categories.name : 'Unknown',
      }))
      setDocuments(formattedDocuments)

    } catch (err: any) {
      console.error('Error fetching worker data:', err.message)
      setError('Failed to load worker data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [workerId])

  useEffect(() => {
    fetchWorkerData()
  }, [fetchWorkerData])

  const handleDeleteDocument = async (documentId: string, fileName: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('worker-documents')
        .remove([fileName])

      if (storageError) throw storageError

      // Delete from worker_documents table
      const { error: dbError } = await supabase
        .from('worker_documents')
        .delete()
        .eq('id', documentId)

      if (dbError) throw dbError

      alert('Document deleted successfully!')
      fetchWorkerData() // Refresh the list
    } catch (err: any) {
      console.error('Error deleting document:', err.message)
      alert('Failed to delete document: ' + err.message)
    }
  }

  if (loading) return <div className="p-8">Loading worker details...</div>
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>
  if (!worker) return <div className="p-8">Worker not found.</div>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <Link href="/workers" className="text-blue-600 hover:underline mb-4 block">
          &larr; Back to Workers List
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Worker Profile: {worker.first_name} {worker.last_name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Personal Details</h2>
            <p><strong>Email:</strong> {worker.email}</p>
            <p><strong>Phone:</strong> {worker.phone}</p>
            <p><strong>Date of Birth:</strong> {format(new Date(worker.date_of_birth), 'PPP')}</p>
            <p><strong>Nationality:</strong> {worker.nationality}</p>
            <p><strong>Passport Number:</strong> {worker.passport_number}</p>
          </div>

          {immigrationStatus && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Immigration Status</h2>
              <p><strong>Visa Type:</strong> {immigrationStatus.visa_type}</p>
              <p><strong>Visa Number:</strong> {immigrationStatus.visa_number}</p>
              <p><strong>Start Date:</strong> {format(new Date(immigrationStatus.start_date), 'PPP')}</p>
              <p><strong>Expiry Date:</strong> {format(new Date(immigrationStatus.expiry_date), 'PPP')}</p>
              <p><strong>BRP Number:</strong> {immigrationStatus.brp_number}</p>
              <p><strong>CoS Reference:</strong> {immigrationStatus.cos_reference}</p>
              <p><strong>Status:</strong> {immigrationStatus.status}</p>
            </div>
          )}
        </div>

        <hr className="my-8" />

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload New Document</h2>
        <DocumentUploadForm workerId={workerId} onUploadSuccess={fetchWorkerData} />

        <hr className="my-8" />

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Worker Documents</h2>
        {documents.length === 0 ? (
          <p>No documents uploaded for this worker yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded At</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {doc.file_name.split('/').pop()} {/* Display just the file name */}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doc.category_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(doc.uploaded_at), 'PPP')}{doc.expiry_date && ` (${format(new Date(doc.uploaded_at), 'p')})`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.expiry_date ? format(new Date(doc.expiry_date), 'PPP') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.is_verified ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Yes
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteDocument(doc.id, doc.file_name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
