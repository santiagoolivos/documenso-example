'use client';

import { Field, Recipient } from '@/types';
import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface DraggableFieldProps {
  field: Field;
  recipients: Recipient[];
  pageWidth: number;
  pageHeight: number;
  onUpdate: (field: Field) => void;
  onDelete: (id: string) => void;
}

const fieldColors: Record<Field['type'], string> = {
  SIGNATURE: 'bg-blue-200 border-blue-600 text-blue-800',
  DATE: 'bg-green-200 border-green-600 text-green-800',
  NAME: 'bg-purple-200 border-purple-600 text-purple-800',
  EMAIL: 'bg-orange-200 border-orange-600 text-orange-800',
  TEXT: 'bg-gray-200 border-gray-600 text-gray-800',
};

export default function DraggableField({
  field,
  recipients,
  pageWidth,
  pageHeight,
  onUpdate,
  onDelete,
}: DraggableFieldProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const widthPercent = (px: number) =>
    pageWidth > 0 ? (px / pageWidth) * 100 : 0;
  const heightPercent = (px: number) =>
    pageHeight > 0 ? (px / pageHeight) * 100 : 0;

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const MIN_WIDTH = 3;
  const MIN_HEIGHT = 2;

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if ((!isDragging && !isResizing) || pageWidth === 0 || pageHeight === 0) {
        return;
      }

      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;

      if (isDragging) {
        const percentDeltaX = widthPercent(deltaX);
        const percentDeltaY = heightPercent(deltaY);

        onUpdate({
          ...field,
          x: clamp(field.x + percentDeltaX, 0, 100 - field.width),
          y: clamp(field.y + percentDeltaY, 0, 100 - field.height),
        });
      } else if (isResizing) {
        const percentDeltaWidth = widthPercent(deltaX);
        const percentDeltaHeight = heightPercent(deltaY);

        onUpdate({
          ...field,
          width: clamp(
            field.width + percentDeltaWidth,
            MIN_WIDTH,
            100 - field.x
          ),
          height: clamp(
            field.height + percentDeltaHeight,
            MIN_HEIGHT,
            100 - field.y
          ),
        });
      }

      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, field, onUpdate, pageWidth, pageHeight]);

  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div
      ref={fieldRef}
      className={`absolute border-2 ${fieldColors[field.type]} ${
        isDragging || isResizing ? 'opacity-80' : ''
      }`}
      style={{
        left: `${field.x}%`,
        top: `${field.y}%`,
        width: `${field.width}%`,
        height: `${field.height}%`,
      }}
    >
      <div className="flex items-center justify-between p-1 h-full">
        <span className="text-xs font-bold truncate flex-1">{field.type}</span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(field.id);
          }}
          className="shrink-0 p-0.5 hover:bg-red-500 hover:text-white rounded transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

