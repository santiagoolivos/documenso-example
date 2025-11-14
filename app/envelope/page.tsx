'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PDFUpload, { UploadResult } from '@/components/PDFUpload';
import FieldToolbar from '@/components/FieldToolbar';
import RecipientForm from '@/components/RecipientForm';
import { Field, Recipient } from '@/types';
import { FileText, Loader2, Send } from 'lucide-react';
import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
});

export default function EnvelopePage() {
  const router = useRouter();
  const [step, setStep] = useState<'upload' | 'design'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [envelopeId, setEnvelopeId] = useState<string>('');
  const [fields, setFields] = useState<Field[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [documentTitle, setDocumentTitle] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRecipientId, setActiveRecipientId] = useState<number | null>(null);

  useEffect(() => {
    if (recipients.length === 0) {
      setActiveRecipientId(null);
      return;
    }

    if (!activeRecipientId || !recipients.some((r) => r.id === activeRecipientId)) {
      setActiveRecipientId(recipients[0].id);
    }
  }, [recipients, activeRecipientId]);

  const handleUploadSuccess = (uploadResult: UploadResult, uploadedFile: File) => {
    const resolvedEnvelopeId =
      uploadResult.envelopeId ??
      (typeof uploadResult.data?.id !== 'undefined' ? String(uploadResult.data.id) : '');

    if (!resolvedEnvelopeId) {
      setError('Failed to upload document. Please try again.');
      return;
    }

    setFile(uploadedFile);
    setEnvelopeId(resolvedEnvelopeId);
    setDocumentTitle(uploadedFile.name);
    setStep('design');
  };

  const handleAddField = (fieldData: Omit<Field, 'id'>) => {
    const newField: Field = {
      id: `field-${Date.now()}-${Math.random()}`,
      ...fieldData,
      recipientId: fieldData.recipientId ?? null,
    };
    setFields([...fields, newField]);
  };

  const handleFieldUpdate = (updatedField: Field) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
  };

  const handleFieldDelete = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSendDocument = async () => {
    if (recipients.length === 0) {
      setError('Please add at least one recipient');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Step 1: Add recipients
      const recipientsResponse = await fetch('/api/documenso/envelope/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          envelopeId,
          recipients: recipients.map(r => ({
            email: r.email,
            name: r.name,
            role: r.role,
          })),
        }),
      });

      if (!recipientsResponse.ok) {
        throw new Error('Failed to add recipients');
      }

      const recipientsData = await recipientsResponse.json();

      // Step 2: Get envelope details to get envelopeItemId
      const envelopeResponse = await fetch(`/api/documenso/envelope/get?envelopeId=${envelopeId}`);
      if (!envelopeResponse.ok) {
        throw new Error('Failed to get envelope details');
      }
      const envelopeData = await envelopeResponse.json();
      const envelopeItemId = envelopeData.data.envelopeItems?.[0]?.id;

      // Step 3: Add fields if any
      if (fields.length > 0 && recipientsData.data.length > 0) {
        const fieldsResponse = await fetch('/api/documenso/envelope/fields', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            envelopeId,
            fields: fields.map((field, index) => ({
              ...field,
              recipientId: recipientsData.data[index % recipientsData.data.length].id,
              envelopeItemId: envelopeItemId,
            })),
          }),
        });

        if (!fieldsResponse.ok) {
          throw new Error('Failed to add fields');
        }
      }

      alert('Document sent successfully!');
      router.push('/');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send document');
    } finally {
      setSending(false);
    }
  };

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-12 h-12 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Send Document
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your PDF document to send for signature
            </p>
          </div>

          <PDFUpload 
            type="DOCUMENT"
            onUploadSuccess={handleUploadSuccess}
          />

          {error && (
            <div className="mt-6 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setStep('upload')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <div>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-2 py-1"
                  placeholder="Document Title"
                />
                <p className="text-sm text-black px-2">
                  {fields.length} field(s), {recipients.length} recipient(s)
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSendDocument}
              disabled={sending || recipients.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Document
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <FieldToolbar onAddField={handleAddField} />
            <RecipientForm
              recipients={recipients}
              onRecipientsChange={setRecipients}
              activeRecipientId={activeRecipientId}
              onSelectRecipient={setActiveRecipientId}
              onFieldDragStart={() => {}}
              onFieldDragEnd={() => {}}
            />
          </div>

          <div className="lg:col-span-3 h-[calc(100vh-180px)]">
            {file && (
              <PDFViewer
                file={file}
                fields={fields}
                recipients={recipients}
                onFieldUpdate={handleFieldUpdate}
                onFieldDelete={handleFieldDelete}
                onFieldAdd={handleAddField}
              />
            )}
          </div>
        </div>

        {error && (
          <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

