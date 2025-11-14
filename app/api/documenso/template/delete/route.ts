import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const templateId = body?.templateId;
    const numericTemplateId = Number(templateId);

    if (!templateId || Number.isNaN(numericTemplateId)) {
      return NextResponse.json(
        { error: 'Missing required field: templateId (number)' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DOCUMENSO_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const host =
      process.env.NEXT_PUBLIC_DOCUMENSO_HOST ||
      'https://app.documenso.com/api/v2';

    const response = await fetch(host + '/template/delete', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId: numericTemplateId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Documenso delete template error:', error);
      return NextResponse.json(
        {
          error: 'Failed to delete template',
          details: error,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


