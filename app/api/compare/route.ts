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
