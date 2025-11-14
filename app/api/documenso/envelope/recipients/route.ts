import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { envelopeId, recipients } = body;

    if (!envelopeId || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json({ 
        error: 'Missing required fields: envelopeId and recipients array' 
      }, { status: 400 });
    }

    const apiKey = process.env.DOCUMENSO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const host = process.env.NEXT_PUBLIC_DOCUMENSO_HOST || 'https://app.documenso.com/api/v2';

    const response = await fetch(host + '/envelope/recipient/create-many', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        envelopeId,
        data: recipients.map((r: any, index: number) => ({
          email: r.email,
          name: r.name,
          role: r.role || 'SIGNER',
          signingOrder: index + 1,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Documenso recipients error:', error);
      return NextResponse.json({ 
        error: 'Failed to add recipients',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Recipients error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

