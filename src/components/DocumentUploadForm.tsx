'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Simple type definitions
interface DocumentCategory {
  id: string;
  name: string;
}

interface Worker {
  id: string;
  first_name: string;
  last_name: string;
}

// Mock API functions (replace with your actual Supabase implementation)
const fetchDocumentCategories = async (): Promise<DocumentCategory[]> => {
  // In a real implementation, this would call Supabase
  return [
    { id: '1', name: 'Passport' },
    { id: '2', name: 'Visa' },
    { id: '3', name: 'BRP' },
    { id: '4', name: 'CoS' },
    { id: '5', name: 'Right to Work Check' },
    { id: '6', name: 'Employment Contract' },
    { id: '7', name: 'Qualifications' },
    { id: '8', name: 'DBS Check' },
    { id: '9', name: 'Training Records' },
    { id: '10', name: 'Address Proof' },
    { id: '11', name: 'Bank Details' },
  ];
};

const uploadDocument = async (formData: FormData): Promise<any> => {
  // In a real implementation, this would handle file upload to Supabase Storage
  // and then insert document metadata into the worker_documents table.
  console.log('Simulating document upload:', Object.fromEntries(formData.entries()));
  return { success: true, message: 'Document uploaded successfully' };
};

export default function DocumentUploadForm({ workerId }: { workerId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchDocumentCategories();
        setDocumentCategories(categories);
      } catch (err) {
        console.error('Error loading document categories:', err);
        setError('Failed to load document categories.');
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file || !categoryId) {
      setError('Please select a file and a document category.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('worker_id', workerId);
      formData.append('category_id', categoryId);
      if (expiryDate) {
        formData.append('expiry_date', expiryDate);
      }

      await uploadDocument(formData);
      setSuccess('Document uploaded successfully!');
      setFile(null);
      setCategoryId('');
      setExpiryDate('');
      // Optionally, refresh the worker detail page or document list
      // router.refresh(); 
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Select Document
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Document Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Select a category</option>
            {documentCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date (Optional)
          </label>
          <input
            id="expiry-date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
}
