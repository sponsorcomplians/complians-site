import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { errorHandlingService, DocumentParseError } from '@/lib/error-handling';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface DocumentMetadata {
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  pageCount?: number;
}

interface DocumentPreviewProps {
  file: File;
  extractedData: any;
  onClose: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  file,
  extractedData,
  onClose
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMetadata({
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileType: file.type || 'Unknown',
      uploadDate: new Date().toLocaleString(),
    });

    setLoadError(null);
    setIsLoading(true);

    if (file.type !== 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentContent(e.target?.result as string);
        setIsLoading(false);
      };
      reader.onerror = (e) => {
        setLoadError('Failed to load text document.');
        setIsLoading(false);
        errorHandlingService.handleError(
          new DocumentParseError('Failed to read text file', { fileName: file.name })
        );
      };
      reader.readAsText(file);
    } else {
      setIsLoading(false); // PDF loading handled by react-pdf events
    }
  }, [file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (metadata) {
      setMetadata({ ...metadata, pageCount: numPages });
    }
    setIsLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    setLoadError('Failed to load PDF document.');
    setIsLoading(false);
    errorHandlingService.handleError(
      new DocumentParseError(error.message, { fileName: file.name })
    );
  };

  const renderPDFPreview = () => (
    <div className="flex flex-col items-center">
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        className="max-w-full"
      >
        <Page 
          pageNumber={pageNumber} 
          scale={scale}
          className="shadow-lg"
        />
      </Document>
      {/* Page Navigation */}
      <div className="flex items-center gap-4 mt-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Page {pageNumber} of {numPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPageNumber(prev => Math.min(numPages || 1, prev + 1))}
          disabled={pageNumber >= (numPages || 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const renderTextPreview = () => (
    <div className="prose dark:prose-invert max-w-none">
      <pre>{documentContent}</pre>
    </div>
  );

  const renderExtractedData = () => (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-3">Extracted Data</h3>
      <pre className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-96">
        {JSON.stringify(extractedData, null, 2)}
      </pre>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
      {/* Error Message */}
      {loadError && (
        <div className="text-red-600 font-medium mb-2">{loadError}</div>
      )}
      {/* Loading Spinner */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading document...</span>
        </div>
      )}
      {/* Document Metadata */}
      {metadata && (
        <Card className="p-3 bg-muted/50">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">File:</span> {metadata.fileName}
            </div>
            <div>
              <span className="font-medium">Size:</span> {metadata.fileSize}
            </div>
            <div>
              <span className="font-medium">Type:</span> {metadata.fileType}
            </div>
            <div>
              <span className="font-medium">Uploaded:</span> {metadata.uploadDate}
            </div>
            {metadata.pageCount && (
              <div className="col-span-2">
                <span className="font-medium">Pages:</span> {metadata.pageCount}
              </div>
            )}
          </div>
        </Card>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Document Preview */}
        <div className="lg:col-span-2">
          <Card className="p-4">
            {!isLoading && !loadError && (file.type === 'application/pdf' ? renderPDFPreview() : renderTextPreview())}
          </Card>
        </div>
        {/* Extracted Data Sidebar */}
        <div className="space-y-4">
          {renderExtractedData()}
        </div>
      </div>
    </div>
  );
}; 