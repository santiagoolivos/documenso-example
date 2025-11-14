'use client';

import { useState } from 'react';
import { Recipient } from '@/types';
import { UserPlus, Trash2 } from 'lucide-react';

interface RecipientFormProps {
  recipients: Recipient[];
  onRecipientsChange: (recipients: Recipient[]) => void;
}

const RECIPIENT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // orange
  '#EF4444', // red
  '#06B6D4', // cyan
];

export default function RecipientForm({
  recipients,
  onRecipientsChange,
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-3 text-black">
            Recipients ({recipients.length})
          </h3>
          
          <div className="space-y-2">
            {recipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
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
                
                <button
                  onClick={() => removeRecipient(recipient.id)}
                  className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

