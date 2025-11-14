import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId } = body;

    if (!templateId) {
      return NextResponse.json({ 
        error: 'Missing required field: templateId' 
      }, { status: 400 });
    }

    const apiKey = process.env.DOCUMENSO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const host = process.env.NEXT_PUBLIC_DOCUMENSO_HOST || 'https://app.documenso.com/api/v2';

    // Generate direct link token for template
    const response = await fetch(host + `/template/${templateId}/direct-link`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enabled: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Documenso token generation error:', error);
      return NextResponse.json({ 
        error: 'Failed to generate signing token',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      token: data.token,
      data: data
    });
    
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

