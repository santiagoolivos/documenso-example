'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Field, Recipient } from '@/types';
import DraggableField from './DraggableField';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
  fields: Field[];
  recipients: Recipient[];
  onFieldUpdate: (field: Field) => void;
  onFieldDelete: (id: string) => void;
  onFieldAdd?: (field: Omit<Field, 'id'>) => void;
}

export default function PDFViewer({
  file,
  fields,
  recipients,
  onFieldUpdate,
  onFieldDelete,
  onFieldAdd,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById('pdf-container');
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const pageWidth = containerWidth > 0 ? containerWidth - 40 : 800;

  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onFieldAdd || pdfDimensions.width === 0 || pdfDimensions.height === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const xPercent = ((e.clientX - rect.left) / pdfDimensions.width) * 100;
    const yPercent = ((e.clientY - rect.top) / pdfDimensions.height) * 100;
    const defaultWidth = 15;
    const defaultHeight = 5;
    const clampedX = Math.max(0, Math.min(100 - defaultWidth, xPercent));
    const clampedY = Math.max(0, Math.min(100 - defaultHeight, yPercent));
    
    onFieldAdd({
      type: 'SIGNATURE',
      x: clampedX,
      y: clampedY,
      width: defaultWidth,
      height: defaultHeight,
      page: currentPage,
      required: true,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Page Navigation */}
      {numPages > 1 && (
        <div className="flex items-center justify-between mb-4 bg-white border border-gray-200 rounded-lg p-3">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-black"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-medium text-black">
            Page {currentPage} of {numPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
            disabled={currentPage === numPages}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-black"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* PDF Document */}
      <div 
        id="pdf-container" 
        className="flex-1 bg-gray-100 rounded-lg overflow-auto p-5"
      >
        <div 
          className="relative inline-block bg-white shadow-lg cursor-crosshair"
          onClick={handlePdfClick}
        >
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              width={pageWidth}
              onLoadSuccess={(page) => {
                setPdfDimensions({ width: page.width, height: page.height });
              }}
            />
          </Document>

          {/* Render fields for current page */}
          {fields
            .filter(field => field.page === currentPage)
            .map(field => (
              <DraggableField
                key={field.id}
                field={field}
                recipients={recipients}
                pageWidth={pdfDimensions.width}
                pageHeight={pdfDimensions.height}
                onUpdate={onFieldUpdate}
                onDelete={onFieldDelete}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

