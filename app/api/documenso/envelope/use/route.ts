import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { envelopeId, recipients, distributeDocument } = body;

    if (!envelopeId) {
      return NextResponse.json({ 
        error: 'Missing required field: envelopeId' 
      }, { status: 400 });
    }

    const apiKey = process.env.DOCUMENSO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const host = process.env.NEXT_PUBLIC_DOCUMENSO_HOST || 'https://app.documenso.com/api/v2';

    const payload: any = {
      envelopeId,
    };

    if (recipients && Array.isArray(recipients)) {
      payload.recipients = recipients;
    }

    if (distributeDocument !== undefined) {
      payload.distributeDocument = distributeDocument;
    }

    const response = await fetch(host + '/envelope/use', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Documenso use template error:', error);
      return NextResponse.json({ 
        error: 'Failed to use template',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Use template error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

