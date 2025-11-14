'use client';

import { Field } from '@/types';
import {
  PenTool,
  Calendar,
  Type,
  Mail,
  User,
  Info,
} from 'lucide-react';

interface FieldToolbarProps {
  onAddField?: (type: Field['type']) => void;
  mode?: 'legacy' | 'recipientBased';
}

const fieldTypes = [
  { type: 'SIGNATURE' as const, icon: PenTool, label: 'Signature', color: 'bg-blue-500' },
  { type: 'DATE' as const, icon: Calendar, label: 'Date', color: 'bg-green-500' },
  { type: 'NAME' as const, icon: User, label: 'Name', color: 'bg-purple-500' },
  { type: 'EMAIL' as const, icon: Mail, label: 'Email', color: 'bg-orange-500' },
  { type: 'TEXT' as const, icon: Type, label: 'Text', color: 'bg-gray-500' },
];

export default function FieldToolbar({
  onAddField,
  mode = 'legacy',
}: FieldToolbarProps) {
  if (mode === 'recipientBased') {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-1 text-black">
              Drag places from a recipient
            </h3>
            <p className="text-sm text-gray-600">
              Select a recipient, then drag one of their field chips onto the document. Each field is automatically assigned to that recipient.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!onAddField) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">Add Fields</h3>
      <div className="flex flex-wrap gap-2">
        {fieldTypes.map(({ type, icon: Icon, label, color }) => (
          <button
            key={type}
            onClick={() => onAddField(type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${color} hover:opacity-90 transition-opacity`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

