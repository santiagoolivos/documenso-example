'use client';

import { Field } from '@/types';
import { 
  PenTool, 
  Calendar, 
  Type, 
  Mail, 
  User 
} from 'lucide-react';

interface FieldToolbarProps {
  onAddField: (type: Field['type']) => void;
}

const fieldTypes = [
  { type: 'SIGNATURE' as const, icon: PenTool, label: 'Signature', color: 'bg-blue-500' },
  { type: 'DATE' as const, icon: Calendar, label: 'Date', color: 'bg-green-500' },
  { type: 'NAME' as const, icon: User, label: 'Name', color: 'bg-purple-500' },
  { type: 'EMAIL' as const, icon: Mail, label: 'Email', color: 'bg-orange-500' },
  { type: 'TEXT' as const, icon: Type, label: 'Text', color: 'bg-gray-500' },
];

export default function FieldToolbar({ onAddField }: FieldToolbarProps) {
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

