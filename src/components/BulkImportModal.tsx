'use client';

import React, { useState } from 'react';
import { Upload, Download, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (workers: any[]) => void;
}

export function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const template = `Employee ID,First Name,Last Name,Email,Department,Position,Start Date,Status,Phone,Address,Emergency Contact,Emergency Phone
EMP003,Alice,Johnson,alice.johnson@company.com,Engineering,Developer,2024-01-15,active,+1 (555) 123-4567,123 Main St,Bob Johnson,+1 (555) 987-6543
EMP004,Bob,Williams,bob.williams@company.com,Sales,Sales Manager,2024-02-01,active,+1 (555) 234-5678,456 Oak Ave,Alice Williams,+1 (555) 876-5432`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'worker_import_template.csv';
    a.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        setError('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const workers = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const worker = {
            employeeId: values[0],
            firstName: values[1],
            lastName: values[2],
            email: values[3],
            department: values[4],
            position: values[5],
            startDate: values[6],
            status: values[7] as 'active' | 'inactive' | 'on-leave',
            phone: values[8] || '',
            address: values[9] || '',
            emergencyContact: values[10] || '',
            emergencyPhone: values[11] || ''
          };
          workers.push(worker);
        }
      }
      setPreview(workers.slice(0, 3)); // Show first 3 rows as preview
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    
    // In a real app, you would validate the data more thoroughly
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      const workers = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const worker = {
            id: Date.now().toString() + i,
            employeeId: values[0],
            firstName: values[1],
            lastName: values[2],
            email: values[3],
            department: values[4],
            position: values[5],
            startDate: values[6],
            status: values[7] as 'active' | 'inactive' | 'on-leave',
            phone: values[8] || '',
            address: values[9] || '',
            emergencyContact: values[10] || '',
            emergencyPhone: values[11] || ''
          };
          workers.push(worker);
        }
      }
      
      onImport(workers);
      setIsProcessing(false);
      handleClose();
    };
    reader.readAsText(file);
  };

  const handleClose = () => {
    setFile(null);
    setError('');
    setPreview([]);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="relative">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
          <CardTitle>Import Workers</CardTitle>
          <CardDescription>
            Upload a CSV file to bulk import worker data
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Download CSV Template</p>
              <p className="text-sm text-gray-600">
                Use our template to ensure your data is formatted correctly
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="csv-upload" className="block text-sm font-medium mb-2">
              Upload CSV File
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <div className="mb-3">
                <label
                  htmlFor="csv-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Choose a file
                </label>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-gray-600"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">CSV files only</p>
              
              {file && (
                <div className="mt-3 inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-md">
                  <span className="text-sm">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Preview (First 3 rows)</h3>
              <div className="border rounded-lg overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Employee ID</th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Email</th>
                      <th className="px-3 py-2 text-left">Department</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((worker, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{worker.employeeId}</td>
                        <td className="px-3 py-2">{worker.firstName} {worker.lastName}</td>
                        <td className="px-3 py-2">{worker.email}</td>
                        <td className="px-3 py-2">{worker.department}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {preview.length} rows will be imported
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || isProcessing}
          >
            {isProcessing ? 'Importing...' : 'Import Workers'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Add this import at the top of the file
import { Label } from '@/components/ui/label';