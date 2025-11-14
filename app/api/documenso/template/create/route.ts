import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { envelopeId } = body;

    if (!envelopeId) {
      return NextResponse.json({ 
        error: 'Missing required field: envelopeId (this should be returned from upload with type TEMPLATE)' 
      }, { status: 400 });
    }

    // En Documenso v2, los templates se crean durante el upload con type="TEMPLATE"
    // Este endpoint simplemente retorna el envelopeId que ya fue creado como template
    // Los siguientes pasos son agregar recipients y fields al envelope
    
    return NextResponse.json({
      success: true,
      templateId: envelopeId,
      data: { id: envelopeId }
    });
    
  } catch (error) {
    console.error('Template creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

