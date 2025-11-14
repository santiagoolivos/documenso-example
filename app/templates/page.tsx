'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, Plus, Edit } from 'lucide-react';

interface TemplateRecipient {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface TemplateField {
  id: number;
  type: string;
  page: number;
}

interface Template {
  id: number;
  title: string;
  createdAt: string;
  recipients: TemplateRecipient[];
  fields: TemplateField[];
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingTemplate, setUsingTemplate] = useState<number | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/documenso/template/list');
      if (!response.ok) {
        throw new Error('Failed to load templates');
      }
      const result = await response.json();
      
      // Documenso returns { data: [...], count, currentPage, perPage, totalPages }
      // Our API wraps it as { success: true, data: { data: [...], ... } }
      const templatesList = result.data?.data || [];
      
      setTemplates(Array.isArray(templatesList) ? templatesList : []);
    } catch (err) {
      console.error('Load templates error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: number) => {
    setUsingTemplate(templateId);
    setError(null);

    try {
      // Get template details first
      const templateResponse = await fetch(`/api/documenso/template/get?templateId=${templateId}`);
      if (!templateResponse.ok) {
        throw new Error('Failed to get template details');
      }
      const templateResult = await templateResponse.json();
      // API returns { success: true, data: { template object with recipients } }
      const templateData = templateResult.data;
      
      // Use template with recipient mappings
      const useResponse = await fetch('/api/documenso/template/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: templateId,
          recipients: templateData.recipients.map((r: TemplateRecipient) => ({
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

      alert('Document created from template and sent for signature!');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use template');
    } finally {
      setUsingTemplate(null);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">
              My Templates
            </h1>
            <p className="text-black">
              Select a template to send for signature
            </p>
          </div>
          <button
            onClick={() => router.push('/template')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create New Template
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Templates Grid */}
        {!loading && templates.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">
              No templates yet
            </h3>
            <p className="text-black mb-6">
              Create your first template to get started
            </p>
            <button
              onClick={() => router.push('/template')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Template
            </button>
          </div>
        )}

        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-3 mb-4">
                  <FileText className="w-8 h-8 text-blue-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-black truncate mb-1">
                      {template.title}
                    </h3>
                    <p className="text-sm text-black">
                      Created {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black">Recipients:</span>
                    <span className="font-medium text-black">
                      {template.recipients?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-black">Fields:</span>
                    <span className="font-medium text-black">
                      {template.fields?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/template?templateId=${template.id}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    disabled={usingTemplate === template.id}
                    className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {usingTemplate === template.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Use'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

