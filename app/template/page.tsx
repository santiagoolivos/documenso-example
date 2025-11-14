'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PDFUpload, { UploadResult } from '@/components/PDFUpload';
import FieldToolbar from '@/components/FieldToolbar';
import RecipientForm from '@/components/RecipientForm';
import { Field, FieldMeta, FieldType, Recipient } from '@/types';
import { FileText, Loader2, Save, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

interface TemplateDetails {
  id: number;
  title?: string;
  createdAt?: string;
  type?: string;
  visibility?: string;
  templateMeta?: {
    signingOrder?: string;
    distributionMethod?: string;
  };
}

const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
});

const FIELD_DEFAULTS: Record<
  FieldType,
  { width: number; height: number; fieldMeta: FieldMeta }
> = {
  SIGNATURE: { width: 18, height: 6, fieldMeta: { label: 'Signature', required: true, fontSize: 18, type: 'signature' } },
  FREE_SIGNATURE: { width: 18, height: 6, fieldMeta: { label: 'Free Signature', required: true, fontSize: 18, type: 'free_signature' } },
  INITIALS: { width: 10, height: 4, fieldMeta: { label: 'Initials', required: true, fontSize: 14, type: 'initials' } },
  NAME: { width: 25, height: 5, fieldMeta: { label: 'Name', required: true, fontSize: 12, type: 'name', textAlign: 'left' } },
  EMAIL: { width: 25, height: 5, fieldMeta: { label: 'Email', required: true, fontSize: 12, type: 'email', textAlign: 'left' } },
  DATE: { width: 20, height: 5, fieldMeta: { label: 'Date', required: true, fontSize: 12, type: 'date', textAlign: 'left' } },
  TEXT: { width: 30, height: 7, fieldMeta: { label: 'Text', required: true, fontSize: 12, type: 'text', textAlign: 'left' } },
  NUMBER: { width: 20, height: 5, fieldMeta: { label: 'Number', required: true, fontSize: 12, type: 'number', textAlign: 'left' } },
  RADIO: { width: 18, height: 8, fieldMeta: { label: 'Radio Options', required: true, fontSize: 12, type: 'radio', direction: 'vertical', values: [{ id: 1, value: 'Option 1', checked: false }] } },
  CHECKBOX: { width: 18, height: 8, fieldMeta: { label: 'Checkbox Options', required: true, fontSize: 12, type: 'checkbox', direction: 'vertical', values: [{ id: 1, value: 'Option 1', checked: false }] } },
  DROPDOWN: { width: 25, height: 6, fieldMeta: { label: 'Dropdown', required: true, fontSize: 12, type: 'dropdown', values: [{ id: 1, value: 'Option 1', checked: false }] } },
};

const DEFAULT_RECIPIENT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#8B5CF6',
  '#F59E0B',
  '#EF4444',
  '#06B6D4',
];

export default function TemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'upload' | 'design' | 'success' | 'view'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [templateTitle, setTemplateTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateDetails, setTemplateDetails] = useState<TemplateDetails | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeRecipientId, setActiveRecipientId] = useState<number | null>(null);
  const [draggingField, setDraggingField] = useState<{
    recipientId: number;
    type: FieldType;
  } | null>(null);
  const visibleFields = useMemo(
    () =>
      activeRecipientId
        ? fields.filter((field) => field.recipientId === activeRecipientId)
        : fields,
    [fields, activeRecipientId]
  );

  useEffect(() => {
    const templateIdParam = searchParams.get('templateId');
    if (templateIdParam) {
      const parsed = Number(templateIdParam);
      if (!Number.isNaN(parsed)) {
        setTemplateId(parsed);
        loadTemplate(parsed);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (recipients.length === 0) {
      setActiveRecipientId(null);
      setDraggingField(null);
      return;
    }

    if (!activeRecipientId || !recipients.some(r => r.id === activeRecipientId)) {
      setActiveRecipientId(recipients[0].id);
    }
  }, [recipients, activeRecipientId]);

  const loadTemplate = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch template data
      const response = await fetch(`/api/documenso/template/get?templateId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to load template');
      }

      const result = await response.json();
      // API returns { success: true, data: { template object } }
      const templateData = result.data;

      if (!templateData) {
        throw new Error('Template data not found');
      }

      setTemplateDetails({
        id: templateData.id,
        title: templateData.title,
        createdAt: templateData.createdAt,
        type: templateData.type,
        visibility: templateData.visibility,
        templateMeta: templateData.templateMeta,
      });

      // Extract template info
      setTemplateTitle(templateData.title || '');

      // Extract and convert recipients
      const templateRecipients = (templateData.recipients || []).map((r: {
        id?: number;
        name?: string;
        email?: string;
        role?: string;
      }, index: number) => ({
        id: r.id || index + 1,
        name: r.name || '',
        email: r.email || '',
        role: r.role || 'SIGNER',
        color: DEFAULT_RECIPIENT_COLORS[index % DEFAULT_RECIPIENT_COLORS.length],
      }));
      setRecipients(templateRecipients);

      // Extract and convert fields
      const templateFields = (templateData.fields || []).map((f: {
        id?: number;
        type?: string;
        positionX?: string | number;
        positionY?: string | number;
        width?: string | number;
        height?: string | number;
        page?: number;
        fieldMeta?: FieldMeta;
        recipientId?: number;
      }) => ({
        id: `field-${f.id || Date.now()}-${Math.random()}`,
        type: (f.type as FieldType) || 'SIGNATURE',
        x: parseFloat(String(f.positionX)) || 0,
        y: parseFloat(String(f.positionY)) || 0,
        width: parseFloat(String(f.width)) || 15,
        height: parseFloat(String(f.height)) || 5,
        page: f.page || 1,
        recipientId: f.recipientId ?? null,
        required: f.fieldMeta?.required !== false,
        fieldMeta: f.fieldMeta,
      }));
      setFields(templateFields);

      setFile(null);
      setStep('view');

    } catch (err) {
      console.error('Load template error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template');
      setStep('upload');
      setTemplateDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (uploadResult: UploadResult, uploadedFile: File) => {
    if (!uploadResult?.templateId) {
      setError('Failed to create template in Documenso. Please try again.');
      return;
    }

    setFile(uploadedFile);
    setTemplateId(uploadResult.templateId);
    setTemplateTitle(uploadedFile.name);
    setTemplateDetails(null);
    setFields([]);
    setRecipients([]);
    setStep('design');
  };

  const handleFieldDragStart = (recipientId: number, type: FieldType) => {
    setDraggingField({ recipientId, type });
  };

  const handleFieldDragEnd = () => {
    setDraggingField(null);
  };

  const handleFieldDrop = (position: { xPercent: number; yPercent: number; page: number }) => {
    if (!draggingField) return;
    const defaults = FIELD_DEFAULTS[draggingField.type];
    const width = defaults.width;
    const height = defaults.height;
    const clampedX = Math.max(0, Math.min(100 - width, position.xPercent));
    const clampedY = Math.max(0, Math.min(100 - height, position.yPercent));

    const newField: Field = {
      id: `field-${Date.now()}-${Math.random()}`,
      type: draggingField.type,
      x: clampedX,
      y: clampedY,
      width,
      height,
      page: position.page,
      recipientId: draggingField.recipientId,
      required: defaults.fieldMeta.required !== false,
      fieldMeta: {
        ...defaults.fieldMeta,
        values: defaults.fieldMeta.values
          ? defaults.fieldMeta.values.map((value) => ({ ...value }))
          : undefined,
      },
    };

    setFields((prev) => [...prev, newField]);
    setDraggingField(null);
  };

  const buildFieldMetaPayload = (field: Field): FieldMeta => {
    const defaults = FIELD_DEFAULTS[field.type];
    const base = field.fieldMeta || {};
    const merged: FieldMeta = {
      ...defaults.fieldMeta,
      ...base,
    };

    merged.label = merged.label || defaults.fieldMeta.label || field.type;
    merged.required = merged.required ?? field.required;
    merged.type = merged.type || defaults.fieldMeta.type || field.type.toLowerCase();
    merged.fontSize = merged.fontSize || defaults.fieldMeta.fontSize || 12;

    return merged;
  };

  const handleFieldUpdate = (updatedField: Field) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
  };

  const handleFieldDelete = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSaveTemplate = async () => {
    if (recipients.length === 0) {
      setError('Please add at least one recipient');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (!templateId) {
        throw new Error('Template not ready. Please upload your PDF again.');
      }

      const currentTemplateId = templateId;

      // Step 1: Add recipients to template
      const recipientsResponse = await fetch('/api/documenso/template/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: currentTemplateId,
          recipients: recipients.map((r, index) => ({
            email: r.email,
            name: r.name,
            role: r.role || 'SIGNER',
            signingOrder: index + 1,
          })),
        }),
      });
      console.log('Recipients response:', recipientsResponse);

      if (!recipientsResponse.ok) {
        const errorText = await recipientsResponse.text();
        console.error('Recipients error:', errorText);
        throw new Error('Failed to add recipients');
      }

      const recipientsData = await recipientsResponse.json();
      console.log('Recipients data:', recipientsData);

      const createdRecipients =
        recipientsData?.data?.recipients ??
        recipientsData?.data?.data ??
        recipientsData?.data ??
        [];

      if (!Array.isArray(createdRecipients) || createdRecipients.length === 0) {
        throw new Error('Documenso did not return created recipients');
      }

      const recipientIdMap = new Map<number, number>();
      createdRecipients.forEach((recipient: { id?: number; email?: string }, index: number) => {
        const localByIndex = recipients[index];
        if (localByIndex?.id && recipient?.id) {
          recipientIdMap.set(localByIndex.id, recipient.id);
        }
        if (recipient?.email) {
          const localByEmail = recipients.find((r) => r.email === recipient.email);
          if (localByEmail?.id && recipient?.id) {
            recipientIdMap.set(localByEmail.id, recipient.id);
          }
        }
      });

      console.log('Fields:', fields);
      // Step 2: Add fields if any
      if (fields.length > 0) {
        console.log('Adding fields');
        const payloadFields = fields
          .map((field, index) => {
            if (!field.recipientId) {
              console.warn('Field missing recipient assignment', field);
              return null;
            }
            const recipientId = recipientIdMap.get(field.recipientId);
            if (!recipientId) {
              console.warn('Could not match recipient for field', field);
              return null;
            }
            return {
              type: field.type,
              page: field.page,
              x: field.x,
              y: field.y,
              width: field.width,
              height: field.height,
              required: field.required !== false,
              recipientId,
              label: field.fieldMeta?.label || field.type,
              fieldMeta: buildFieldMetaPayload(field),
            };
          })
          .filter(Boolean);

        if (payloadFields.length === 0) {
          throw new Error('Could not resolve recipient IDs for fields');
        }

        const fieldsResponse = await fetch('/api/documenso/template/fields', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: currentTemplateId,
            fields: payloadFields,
          }),
        });

        console.log('Fields response:', fieldsResponse);

        if (!fieldsResponse.ok) {
          const errorText = await fieldsResponse.text();
          console.error('Fields error:', errorText);
          throw new Error('Failed to add fields');
        }
      }

      setStep('success');

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      console.log('Saving false');
      setSaving(false);
    }
  };

  const handleUseTemplate = async () => {
    if (!templateId) return;

    setSaving(true);
    setError(null);

    try {
      // Get template details first
      const templateResponse = await fetch(
        `/api/documenso/template/get?templateId=${templateId}`
      );
      if (!templateResponse.ok) {
        throw new Error('Failed to get template details');
      }
      const templateResult = await templateResponse.json();
      // API returns { success: true, data: { template object with recipients } }
      const templateRecipients: Array<{
        id: number;
        email: string;
        name: string;
      }> = templateResult?.data?.recipients ?? [];
      if (templateRecipients.length === 0) {
        throw new Error('Template has no recipients to send to');
      }
      
      // Use template with recipient mappings
      const useResponse = await fetch('/api/documenso/template/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: templateId,
          recipients: templateRecipients.map((r) => ({
            id: r.id,
            email: r.email,
            name: r.name,
          })),
          distributeDocument: true,
        }),
      });

      if (!useResponse.ok) {
        throw new Error('Failed to use template');
      }

      await useResponse.json();
      alert('Document created from template and sent for signature!');
      router.push('/');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use template');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateId) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch('/api/documenso/template/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete template error:', errorText);
        throw new Error('Failed to delete template');
      }

      await response.json();
      alert('Template deleted successfully');
      router.push('/templates');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setDeleting(false);
    }
  };

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Create Template
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your PDF document to create a reusable template
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-lg text-gray-700">Loading template...</p>
            </div>
          ) : (
            <PDFUpload 
              type="TEMPLATE"
              onUploadSuccess={handleUploadSuccess}
            />
          )}

          {error && (
            <div className="mt-6 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-black mb-2">
                  Template Created Successfully!
                </h1>
                <p className="text-black">
                  Your template &ldquo;{templateTitle}&rdquo; is ready to use
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleUseTemplate}
                  disabled={saving}
                  className="w-full px-6 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Use Template Now
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full px-6 py-4 bg-gray-200 text-black font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Home
                </button>

                <button
                  onClick={() => {
                    setStep('upload');
                    setFile(null);
                    setTemplateId(null);
                    setFields([]);
                    setRecipients([]);
                    setTemplateTitle('');
                  }}
                  className="w-full px-6 py-4 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Create Another Template
                </button>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'view' && templateDetails) {
    const createdDate = templateDetails.createdAt
      ? new Date(templateDetails.createdAt).toLocaleString()
      : 'Not available';
    const displayedFields = fields.slice(0, 10);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-10 space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/templates')}
              className="text-blue-600 hover:underline"
            >
              ← Back to Templates
            </button>

            <button
              onClick={() => router.push('/template')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Template
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">
                  Template
                </p>
                <h1 className="text-3xl font-bold text-black">
                  {templateTitle}
                </h1>
                <p className="text-sm text-gray-600">
                  ID: {templateDetails.id} · Created: {createdDate}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Type: {templateDetails.type || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Visibility: {templateDetails.visibility || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  Signing: {templateDetails.templateMeta?.signingOrder || 'N/A'} ·{' '}
                  Distribution: {templateDetails.templateMeta?.distributionMethod || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-black mb-3">
                  Recipients ({recipients.length})
                </h2>
                {recipients.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    This template has no recipients configured.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {recipients.map((recipient) => (
                      <li
                        key={(recipient.id ?? recipient.email) || `${recipient.email}-${recipient.role}`}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <p className="font-medium text-black">{recipient.name}</p>
                        <p className="text-sm text-gray-600">{recipient.email}</p>
                        <p className="text-xs text-gray-500">
                          Role: {recipient.role || 'SIGNER'}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h2 className="text-lg font-semibold text-black mb-3">
                  Fields ({fields.length})
                </h2>
                {fields.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    This template has no fields configured.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {displayedFields.map((field) => (
                      <li
                        key={field.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <p className="font-medium text-black">
                          {field.type} · Page {field.page}
                        </p>
                        <p className="text-xs text-gray-600">
                          Required: {field.required ? 'Yes' : 'No'}
                        </p>
                      </li>
                    ))}
                    {fields.length > displayedFields.length && (
                      <li className="text-sm text-gray-600">
                        + {fields.length - displayedFields.length} more field(s)
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={handleUseTemplate}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    Use Template
                  </>
                )}
              </button>

              <button
                onClick={handleDeleteTemplate}
                disabled={deleting}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Delete Template
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
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
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  placeholder="Template Title"
                />
                <div className="text-sm text-black px-2 space-y-1">
                  <p>
                    {fields.length} field(s), {recipients.length} recipient(s)
                  </p>
                  {recipients.length > 0 && (
                    <p className="text-xs text-gray-600">
                      Viewing:{' '}
                      {activeRecipientId
                        ? recipients.find((r) => r.id === activeRecipientId)?.name ??
                          'Recipient'
                        : 'All recipients'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveTemplate}
              disabled={saving || recipients.length === 0}
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
                  Save Template
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <FieldToolbar mode="recipientBased" />
            <RecipientForm
              recipients={recipients}
              onRecipientsChange={setRecipients}
              activeRecipientId={activeRecipientId}
              onSelectRecipient={setActiveRecipientId}
              onFieldDragStart={handleFieldDragStart}
              onFieldDragEnd={handleFieldDragEnd}
            />
          </div>

          <div className="lg:col-span-3 h-[calc(100vh-180px)]">
            {file && (
              <PDFViewer
                file={file}
                fields={visibleFields}
                recipients={recipients}
                onFieldUpdate={handleFieldUpdate}
                onFieldDelete={handleFieldDelete}
                onFieldDrop={handleFieldDrop}
                isFieldDragActive={Boolean(draggingField)}
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

