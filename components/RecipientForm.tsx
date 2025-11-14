'use client';

import { useState } from 'react';
import { FieldType, Recipient } from '@/types';
import { UserPlus, Trash2 } from 'lucide-react';

interface RecipientFormProps {
  recipients: Recipient[];
  onRecipientsChange: (recipients: Recipient[]) => void;
  activeRecipientId: number | null;
  onSelectRecipient: (recipientId: number | null) => void;
  onFieldDragStart: (recipientId: number, type: FieldType) => void;
  onFieldDragEnd: () => void;
}

const RECIPIENT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // orange
  '#EF4444', // red
  '#06B6D4', // cyan
];

const FIELD_LIBRARY: Array<{
  type: FieldType;
  label: string;
  description: string;
}> = [
  { type: 'SIGNATURE', label: 'Signature', description: 'Required signature block' },
  { type: 'FREE_SIGNATURE', label: 'Free Signature', description: 'Free-form drawn signature' },
  { type: 'INITIALS', label: 'Initials', description: 'Initials box' },
  { type: 'NAME', label: 'Name', description: 'Prefilled signer name' },
  { type: 'EMAIL', label: 'Email', description: 'Prefilled signer email' },
  { type: 'DATE', label: 'Date', description: 'Date field' },
  { type: 'TEXT', label: 'Text', description: 'Short text input' },
  { type: 'NUMBER', label: 'Number', description: 'Numeric input' },
  { type: 'RADIO', label: 'Radio', description: 'Select-one options' },
  { type: 'CHECKBOX', label: 'Checkbox', description: 'Multiple choice' },
  { type: 'DROPDOWN', label: 'Dropdown', description: 'Select list' },
];

export default function RecipientForm({
  recipients,
  onRecipientsChange,
  activeRecipientId,
  onSelectRecipient,
  onFieldDragStart,
  onFieldDragEnd,
}: RecipientFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const addRecipient = () => {
    if (!name.trim() || !email.trim()) return;

    const newRecipient: Recipient = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      role: 'SIGNER',
      color: RECIPIENT_COLORS[recipients.length % RECIPIENT_COLORS.length],
    };

    onRecipientsChange([...recipients, newRecipient]);
    setName('');
    setEmail('');
  };

  const removeRecipient = (id: number) => {
    if (activeRecipientId === id) {
      onSelectRecipient(null);
    }
    onRecipientsChange(recipients.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-3 text-black">Add Recipient</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        
        <button
          onClick={addRecipient}
          disabled={!name.trim() || !email.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Recipient
        </button>
      </div>

      {recipients.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-black">
              Recipients ({recipients.length})
            </h3>
            {activeRecipientId ? (
              <button
                onClick={() => onSelectRecipient(null)}
                className="text-xs text-blue-600 hover:underline"
              >
                Show all fields
              </button>
            ) : null}
          </div>
          
          <div className="space-y-4">
            {recipients.map((recipient) => {
              const isActive = activeRecipientId === recipient.id;
              return (
                <div
                  key={recipient.id}
                  className={`p-3 rounded-lg border ${
                    isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: recipient.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-black truncate">
                          {recipient.name}
                        </p>
                        <p className="text-xs text-black truncate">
                          {recipient.email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          onSelectRecipient(isActive ? null : recipient.id)
                        }
                        className={`px-3 py-1 text-xs rounded-lg border ${
                          isActive
                            ? 'border-blue-500 bg-white text-blue-600'
                            : 'border-gray-300 bg-white text-gray-700'
                        }`}
                      >
                        {isActive ? 'Active' : 'Set active'}
                      </button>
                      <button
                        onClick={() => removeRecipient(recipient.id)}
                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">
                      Drag a field to the document
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {FIELD_LIBRARY.map((field) => (
                        <button
                          key={`${recipient.id}-${field.type}`}
                          draggable={isActive}
                          onDragStart={(event) => {
                            if (!isActive) return;
                            event.dataTransfer.setData('text/plain', field.type);
                            event.dataTransfer.effectAllowed = 'copy';
                            onFieldDragStart(recipient.id, field.type);
                          }}
                          onDragEnd={(event) => {
                            event.preventDefault();
                            onFieldDragEnd();
                          }}
                          className={`px-3 py-1 text-xs rounded-full border ${
                            isActive
                              ? 'border-blue-500 text-blue-600 bg-white'
                              : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                          }`}
                        >
                          {field.label}
                        </button>
                      ))}
                    </div>
                    {!isActive && (
                      <p className="text-[11px] text-gray-500 mt-2">
                        Select this recipient to enable their fields.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

