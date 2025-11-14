'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmbedDirectTemplate } from '@documenso/embed-react';
import { CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function SignPage() {
  const router = useRouter();
  const [token, setToken] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'completed' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const storedToken = sessionStorage.getItem('signingToken');
    if (!storedToken) {
      router.push('/');
      return;
    }
    setToken(storedToken);
  }, [router]);

  const handleDocumentReady = () => {
    console.log('Document is ready for signing');
    setStatus('ready');
  };

  const handleDocumentCompleted = () => {
    console.log('Document has been completed');
    setStatus('completed');
  };

  const handleDocumentError = (error: any) => {
    console.error('Document error:', error);
    setStatus('error');
    setErrorMessage(error?.message || 'An error occurred while loading the document');
  };

  const handleStartOver = () => {
    sessionStorage.clear();
    router.push('/');
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/template-builder')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">Sign Document</h1>
            </div>

            <button
              onClick={handleStartOver}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      <div className="container mx-auto px-4 py-6">
        {status === 'loading' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-blue-800">Loading document...</p>
          </div>
        )}

        {status === 'ready' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">Document is ready for signing</p>
          </div>
        )}

        {status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-green-900 mb-2">
                  Document Completed!
                </h2>
                <p className="text-green-800 mb-4">
                  The document has been successfully signed and completed.
                </p>
                <button
                  onClick={handleStartOver}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Another Template
                </button>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-red-900 mb-2">
                  Error Loading Document
                </h2>
                <p className="text-red-800 mb-4">{errorMessage}</p>
                <button
                  onClick={handleStartOver}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Signing Component */}
      {status !== 'completed' && (
        <div className="container mx-auto px-4 pb-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ minHeight: '600px' }}>
            <EmbedDirectTemplate
              token={token}
              host={process.env.NEXT_PUBLIC_DOCUMENSO_HOST}
              onDocumentReady={handleDocumentReady}
              onDocumentCompleted={handleDocumentCompleted}
              onDocumentError={handleDocumentError}
            />
          </div>
        </div>
      )}
    </div>
  );
}

