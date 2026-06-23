import { NextResponse } from 'next/server';
import { generateSalonComparison } from '../../../lib/groq';
import { generateComparisonMetrics } from '../../../lib/analyticsEngine';

export async function POST(req: Request) {
  try {
    const { query, salons, memoryContext } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (!salons || !Array.isArray(salons) || salons.length === 0) {
      return NextResponse.json({ error: 'Salons data is required for comparison' }, { status: 400 });
    }

    const useFastApi = process.env.ENABLE_FASTAPI_BACKEND === 'true';
    const fastApiUrl = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

    if (useFastApi) {
      try {
        const response = await fetch(`${fastApiUrl}/api/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, salons, memoryContext })
        });
        if (response.ok) {
          const result = await response.json();
          return NextResponse.json(result);
        } else {
          console.warn(`FastAPI returned status ${response.status} for compare. Falling back.`);
        }
      } catch (err) {
        console.error('FastAPI connection error during salon comparison. Falling back:', err);
      }
    }

    // Process raw salon data into optimized analytics metrics
    const metrics = generateComparisonMetrics(salons);

    // Call Groq LLM with the structured metrics
    const comparisonResponseStr = await generateSalonComparison(query, metrics, memoryContext);
    
    // Parse the JSON response
    let comparisonData;
    try {
      comparisonData = JSON.parse(comparisonResponseStr);
    } catch (parseError) {
      console.error('Failed to parse Groq response as JSON:', comparisonResponseStr);
      throw new Error('LLM returned invalid JSON structure.');
    }

    return NextResponse.json(comparisonData);
  } catch (error: any) {
    console.error('Error in /api/compare route:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during comparison.' },
      { status: 500 }
    );
  }
}
