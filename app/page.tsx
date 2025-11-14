'use client';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const handleContinueTemplate = () => {
    router.push('/template');
  };

  const handleContinueEnvelope = () => {
    router.push('/envelope');
  };

  const handleViewTemplates = () => {
    router.push('/templates');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="w-12 h-12 text-blue-600" />
                <h1 className="text-4xl font-bold text-black">
                  Documenso Platform
                </h1>
              </div>
              <p className="text-lg text-black max-w-2xl mx-auto">
                Create reusable templates or send documents for signature
              </p>
        </div>

        {/* Quick Action Button */}
        <div className="max-w-4xl mx-auto mb-6">
          <button
            onClick={handleViewTemplates}
            className="w-full px-6 py-4 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors border-2 border-blue-600 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-5 h-5" />
            View My Templates
          </button>
        </div>

        {/* Upload Section */}
        <div className="max-w-4xl mx-auto">

          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">

              <div className="flex gap-4">
                <button
                  onClick={handleContinueTemplate}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Create Template
                </button>
                <button
                  onClick={handleContinueEnvelope}
                  className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  Send Document
                </button>
              </div>
            </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 text-black">
                  How it works:
                </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      1
                    </div>
                    <h3 className="font-semibold mb-2 text-black">Upload PDF</h3>
                    <p className="text-sm text-black">
                      Upload your PDF document to get started
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      2
                    </div>
                    <h3 className="font-semibold mb-2 text-black">Choose Action</h3>
                    <p className="text-sm text-black">
                      Create a reusable template or send a one-time document
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      3
                    </div>
                    <h3 className="font-semibold mb-2 text-black">Add Recipients & Fields</h3>
                    <p className="text-sm text-black">
                      Configure recipients and signature fields, then send
                    </p>
                  </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
