import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fastApiUrl = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';
    
    // Extract Authorization header to forward client ID tokens cryptographically
    const authHeader = request.headers.get('Authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch(`${fastApiUrl}/api/ai/agent`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
    
    if (response.ok) {
      const result = await response.json();
      return NextResponse.json(result);
    } else {
      const errorText = await response.text();
      return NextResponse.json({ error: `FastAPI error: ${errorText}` }, { status: response.status });
    }
  } catch (error: any) {
    console.error('Error in Next.js /api/ai/agent proxy route:', error);
    return NextResponse.json({ 
      error: 'An internal error occurred while processing your request.',
      details: error.message || String(error)
    }, { status: 500 });
  }
}
