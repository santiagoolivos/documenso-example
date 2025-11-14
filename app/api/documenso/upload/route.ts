import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'DOCUMENT'; // DOCUMENT or TEMPLATE
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const apiKey = process.env.DOCUMENSO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const host = process.env.NEXT_PUBLIC_DOCUMENSO_HOST || 'https://app.documenso.com/api/v2';

    const isTemplate = type === 'TEMPLATE';
    const uploadFormData = new FormData();

    if (isTemplate) {
      const payload = {
        title: file.name,
      };
      uploadFormData.append('payload', JSON.stringify(payload));
      uploadFormData.append('file', file);
    } else {
      const payload = {
        type,
        title: file.name
      };
      uploadFormData.append('payload', JSON.stringify(payload));
      uploadFormData.append('files', file);
    }

    const endpoint = isTemplate ? '/template/create' : '/envelope/create';

    const response = await fetch(host + endpoint, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Documenso upload error:', error);
      return NextResponse.json({ 
        error: 'Failed to upload document to Documenso',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();

    if (isTemplate) {
      return NextResponse.json({
        success: true,
        templateId: data.id,
        envelopeId: data.envelopeId,
        data,
      });
    }

    return NextResponse.json({
      success: true,
      envelopeId: data.id,
      data: data
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

