'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2 } from 'lucide-react';

export interface UploadResult {
  envelopeId?: string;
  templateId?: number;
  [key: string]: any;
}

interface PDFUploadProps {
  onUploadSuccess: (result: UploadResult, file: File) => void;
  type?: 'DOCUMENT' | 'TEMPLATE';
  autoUpload?: boolean;
}

export default function PDFUpload({ onUploadSuccess, type = 'DOCUMENT', autoUpload = true }: PDFUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    if (!autoUpload) {
      // Just return the file without uploading
      onUploadSuccess({}, file);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/documenso/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      onUploadSuccess(data, file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess, type, autoUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <>
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
              <p className="text-lg font-medium">Uploading...</p>
            </>
          ) : isDragActive ? (
            <>
              <FileText className="w-16 h-16 text-blue-500" />
              <p className="text-lg font-medium">Drop your PDF here</p>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-gray-400" />
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop your PDF here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse files
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

