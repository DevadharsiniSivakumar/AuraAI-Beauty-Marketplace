import { NextResponse } from 'next/server';
import { generateAiJourneyPlan, generateLocalJourneyFallback } from '../../../../lib/groq';
import { buildUserMemoryContext } from '../../../../lib/userMemory';

export async function POST(request: Request) {
  try {
    const { userGoal, userProfile, userMemory } = await request.json();

    if (!userGoal || typeof userGoal !== 'string') {
      return NextResponse.json({ error: 'User goal is required.' }, { status: 400 });
    }

    const useFastApi = process.env.ENABLE_FASTAPI_BACKEND === 'true';
    const fastApiUrl = process.env.FASTAPI_BACKEND_URL || 'http://localhost:8000';

    if (useFastApi) {
      try {
        const response = await fetch(`${fastApiUrl}/api/journey/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userGoal, userProfile, userMemory })
        });
        if (response.ok) {
          const result = await response.json();
          return NextResponse.json(result);
        } else {
          console.warn(`FastAPI returned status ${response.status} for journey generation. Falling back.`);
        }
      } catch (err) {
        console.error('FastAPI connection error during journey generation. Falling back:', err);
      }
    }

    const userName = userProfile?.name || 'Guest';
    const memoryContext = userMemory ? buildUserMemoryContext(userMemory) : '';

    let journeyPlan: any = null;
    const hasApiKey = !!process.env.GROQ_API_KEY;

    if (hasApiKey) {
      try {
        const aiResponse = await generateAiJourneyPlan(userGoal, userName, memoryContext);
        // Clean potential markdown code blocks if the LLM outputted them despite instructions
        let cleanResponse = aiResponse.trim();
        if (cleanResponse.startsWith('```')) {
          cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        journeyPlan = JSON.parse(cleanResponse);
      } catch (apiError: any) {
        console.error('Groq API or JSON parse error during journey generation, falling back:', apiError);
        journeyPlan = generateLocalJourneyFallback(userGoal);
      }
    } else {
      console.warn('GROQ_API_KEY not found. Operating in local journey fallback mode.');
      journeyPlan = generateLocalJourneyFallback(userGoal);
    }

    // Double check that steps status is initialized to 'Pending'
    if (journeyPlan && Array.isArray(journeyPlan.steps)) {
      journeyPlan.steps = journeyPlan.steps.map((step: any, index: number) => ({
        stepNumber: step.stepNumber || (index + 1),
        title: step.title || `Step ${index + 1}`,
        description: step.description || '',
        timeline: step.timeline || `Phase ${index + 1}`,
        recommendedService: step.recommendedService || 'Advanced Hydra Facial',
        status: 'Pending'
      }));
    } else {
      // In case the plan structure is invalid, fallback
      journeyPlan = generateLocalJourneyFallback(userGoal);
      journeyPlan.steps = journeyPlan.steps.map((step: any) => ({
        ...step,
        status: 'Pending'
      }));
    }

    return NextResponse.json(journeyPlan);

  } catch (error: any) {
    console.error('Error in journey generation API handler:', error);
    return NextResponse.json({
      error: 'An internal error occurred while processing your request.',
      details: error.message || String(error)
    }, { status: 500 });
  }
}
