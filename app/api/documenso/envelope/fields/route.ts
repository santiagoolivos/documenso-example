import { NextRequest, NextResponse } from 'next/server';

const clampPercent = (value: number) =>
  Number(Math.min(100, Math.max(0, value)).toFixed(4));

type EnvelopeFieldInput = {
  type: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  recipientId?: number;
  envelopeItemId?: string;
  label?: string;
  required?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { envelopeId, fields } = body;

    if (!envelopeId || !fields || !Array.isArray(fields)) {
      return NextResponse.json({ 
        error: 'Missing required fields: envelopeId and fields array' 
      }, { status: 400 });
    }

    const apiKey = process.env.DOCUMENSO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const host = process.env.NEXT_PUBLIC_DOCUMENSO_HOST || 'https://app.documenso.com/api/v2';

    const normalizedFields = (fields as EnvelopeFieldInput[])
      .filter(
        (field) =>
          typeof field.recipientId === 'number' && field.envelopeItemId
      )
      .map((field) => ({
        recipientId: field.recipientId,
        envelopeItemId: field.envelopeItemId,
        type: field.type,
        page: field.page,
        positionX: clampPercent(field.x),
        positionY: clampPercent(field.y),
        width: clampPercent(field.width),
        height: clampPercent(field.height),
        fieldMeta: {
          type: field.type.toLowerCase(),
          label: field.label || '',
          placeholder: '',
          required: field.required !== false,
          readOnly: false,
          fontSize: field.type === 'SIGNATURE' ? 18 : 12,
        },
      }));

    if (normalizedFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to add' },
        { status: 400 }
      );
    }

    const response = await fetch(host + '/envelope/field/create-many', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        envelopeId,
        data: normalizedFields,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Documenso fields error:', error);
      return NextResponse.json({ 
        error: 'Failed to add fields',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Fields error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

