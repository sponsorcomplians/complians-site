'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Supabase client
const supabase = createClientComponentClient()

// Simple type definitions
interface DocumentCategory {
  id: string;
  name: string;
}

interface DocumentUploadFormProps {
  workerId: string;
  onUploadSuccess: () => void; // Add this prop definition
}

export default function DocumentUploadForm({ workerId, onUploadSuccess }: DocumentUploadFormProps) {
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
        const { data, error } = await supabase
          .from('document_categories')
          .select('*')

        if (error) throw error;
        setDocumentCategories(data || []);
      } catch (err: any) {
        console.error('Error fetching document categories:', err.message);
        setError('Failed to load document categories.');
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!file) {
      setError('Please select a file to upload.');
      setLoading(false);
      return;
    }

    if (!categoryId) {
      setError('Please select a document category.');
      setLoading(false);
      return;
    }

    const fileExtension = file.name.split('.').pop();
    const filePath = `${workerId}/${categoryId}/${Date.now()}.${fileExtension}`;

    try {
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('worker-documents') // Ensure this bucket exists and is named 'worker-documents'
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('worker-documents')
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL for the uploaded file.');
      }

      // Insert document metadata into the worker_documents table
      const { error: insertError } = await supabase
        .from('worker_documents')
        .insert({
          worker_id: workerId,
          category_id: categoryId,
          file_name: filePath, // Store the full path for deletion
          file_url: publicUrlData.publicUrl,
          expiry_date: expiryDate || null,
          is_verified: false, // Default to false
        });

      if (insertError) throw insertError;

      setSuccess('Document uploaded successfully!');
      setFile(null); // Clear the file input
      setCategoryId(''); // Clear category selection
      setExpiryDate(''); // Clear expiry date
      onUploadSuccess(); // Call the callback to refresh the list in parent component
    } catch (err: any) {
      console.error('Error uploading document:', err.message);
      setError('Failed to upload document: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
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
          />
        </div>

        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
            Document Category
          </label>
          <select
            id="category-select"
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
