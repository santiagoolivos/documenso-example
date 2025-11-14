export interface Field {
  id: string;
  type: 'SIGNATURE' | 'DATE' | 'TEXT' | 'EMAIL' | 'NAME';
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  recipientId?: number;
  required: boolean;
}

export interface Recipient {
  id: number;
  name: string;
  email: string;
  role: 'SIGNER' | 'APPROVER' | 'CC' | 'VIEWER';
  color?: string;
}

export interface UploadedDocument {
  documentDataId: string;
  file: File;
  url?: string;
}

export interface TemplateData {
  templateId?: number;
  title: string;
  documentDataId: string;
  fields: Field[];
  recipients: Recipient[];
}

