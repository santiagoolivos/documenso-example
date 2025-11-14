import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const envelopeId = searchParams.get('envelopeId');

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

    const response = await fetch(host + `/envelope/${envelopeId}`, {
      method: 'GET',
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Documenso get envelope error:', error);
      return NextResponse.json({ 
        error: 'Failed to get envelope',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });
    
  } catch (error) {
    console.error('Get envelope error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

