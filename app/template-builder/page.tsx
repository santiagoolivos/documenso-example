'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import FieldToolbar from '@/components/FieldToolbar';
import RecipientForm from '@/components/RecipientForm';
import { Field, Recipient } from '@/types';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

// Dynamic import to avoid SSR issues with react-pdf
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
    </div>
  ),
});

export default function TemplateBuilder() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [documentDataId, setDocumentDataId] = useState<string>('');
  const [fields, setFields] = useState<Field[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [templateTitle, setTemplateTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve uploaded file data from sessionStorage
    const storedDocumentDataId = sessionStorage.getItem('documentDataId');
    const storedFileUrl = sessionStorage.getItem('fileUrl');
    const storedFileName = sessionStorage.getItem('fileName');

    if (!storedDocumentDataId || !storedFileUrl) {
      router.push('/');
      return;
    }

    setDocumentDataId(storedDocumentDataId);
    setTemplateTitle(storedFileName || 'Untitled Template');

    // Fetch the file from the blob URL
    fetch(storedFileUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], storedFileName || 'document.pdf', { type: 'application/pdf' });
        setFile(file);
      })
      .catch(err => {
        console.error('Error loading file:', err);
        setError('Failed to load document');
      });
  }, [router]);

  const handleAddField = (type: Field['type']) => {
    const newField: Field = {
      id: `field-${Date.now()}-${Math.random()}`,
      type,
      x: 100,
      y: 100,
      width: 150,
      height: 40,
      page: 1,
      required: true,
    };
    setFields([...fields, newField]);
  };

  const handleFieldUpdate = (updatedField: Field) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
  };

  const handleFieldDelete = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSaveTemplate = async () => {
    if (fields.length === 0) {
      setError('Please add at least one field');
      return;
    }

    if (recipients.length === 0) {
      setError('Please add at least one recipient');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Step 1: Create template
      const createResponse = await fetch('/api/documenso/template/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: templateTitle,
          documentDataId: documentDataId,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create template');
      }

      const { templateId } = await createResponse.json();

      // Step 2: Add recipients
      const recipientsResponse = await fetch('/api/documenso/template/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
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
      const recipientIds = recipientsData.data.recipients || [];

      // Step 3: Add fields
      const fieldsResponse = await fetch('/api/documenso/template/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          fields: fields.map((field, index) => ({
            ...field,
            recipientId: recipientIds[index % recipientIds.length]?.id,
          })),
        }),
      });

      if (!fieldsResponse.ok) {
        throw new Error('Failed to add fields');
      }

      // Step 4: Generate token
      const tokenResponse = await fetch('/api/documenso/template/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to generate signing token');
      }

      const { token } = await tokenResponse.json();

      // Store token and navigate to sign page
      sessionStorage.setItem('signingToken', token);
      router.push('/sign');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  if (!file) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <input
                  type="text"
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  placeholder="Template Title"
                />
                <p className="text-sm text-gray-500 px-2">
                  {fields.length} field(s), {recipients.length} recipient(s)
                </p>
              </div>
            </div>
            
            <button
              onClick={handleSaveTemplate}
              disabled={saving || fields.length === 0 || recipients.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save & Continue
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tools */}
          <div className="lg:col-span-1 space-y-6">
            <FieldToolbar onAddField={handleAddField} />
            <RecipientForm
              recipients={recipients}
              onRecipientsChange={setRecipients}
            />
          </div>

          {/* Main PDF Viewer */}
          <div className="lg:col-span-3 h-[calc(100vh-180px)]">
            <PDFViewer
              file={file}
              fields={fields}
              recipients={recipients}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

