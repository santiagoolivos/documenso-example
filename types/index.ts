export type FieldType =
  | 'SIGNATURE'
  | 'FREE_SIGNATURE'
  | 'INITIALS'
  | 'NAME'
  | 'EMAIL'
  | 'DATE'
  | 'TEXT'
  | 'NUMBER'
  | 'RADIO'
  | 'CHECKBOX'
  | 'DROPDOWN';

export interface FieldMetaValue {
  id?: number;
  value: string;
  checked?: boolean;
}

export interface FieldMeta {
  type?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  numberFormat?: string | null;
  value?: string;
  minValue?: number | null;
  maxValue?: number | null;
  characterLimit?: number;
  lineHeight?: number | null;
  letterSpacing?: number | null;
  verticalAlign?: 'top' | 'middle' | 'bottom' | null;
  direction?: 'vertical' | 'horizontal';
  values?: FieldMetaValue[];
  defaultValue?: string;
}

export interface Field {
  id: string;
  type: FieldType;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  recipientId: number | null;
  required: boolean;
  fieldMeta?: FieldMeta;
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

