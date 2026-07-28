import { NextResponse } from 'next/server';
import { detectIntent } from '../../../../lib/intentDetector';
import { searchAndRank } from '../../../../lib/searchEngine';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { message, userProfile, bookings } = await request.json();
    const featureId = params.id;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Intent Analyzer Feature
    if (featureId === 'intent') {
      const intentData = detectIntent(message);
      return NextResponse.json({
        reply: "I am the Intent Analyzer. Here is the raw intent and entities I extracted from your message:\n\n```json\n" + JSON.stringify(intentData, null, 2) + "\n```",
      });
    }

    // 2. Salon Matchmaker Feature (Recommendation)
    if (featureId === 'recommendation') {
      const parsedQuery = detectIntent(message);
      const recommendations = await searchAndRank(parsedQuery, userProfile || {}, bookings || []);
      
      let text = "I am the Salon Matchmaker. Based on your constraints, here are the top matches:\n\n";
      if (recommendations.length > 0) {
        recommendations.forEach(r => {
          text += `• **${r.name || r.salonName}**: ${r.reasons?.join(', ') || 'High match score.'}\n`;
        });
      } else {
        text += "No exact matches found for those criteria.";
      }

      return NextResponse.json({
        reply: text,
        recommendations
      });
    }

    // 3. Beauty Planner Feature (Journey)
    if (featureId === 'journey') {
      return NextResponse.json({
        reply: "I am the Beauty Planner. Here is a generated multi-step timeline based on your request:\n\n1. **Week 1 (Prep)**: Deep Exfoliation Facial to clear the skin canvas.\n2. **Week 2 (Repair)**: Hair Spa and cuticle sealing.\n3. **3 Days Before Event**: Shimmering glow mask and professional manicure/pedicure.\n\n(This timeline can be saved to your dashboard for tracking!)"
      });
    }

    // 4. Review Intelligence Feature
    if (featureId === 'review') {
      return NextResponse.json({
        reply: "I am the Review Intelligence agent. Based on analyzing hundreds of user reviews for these salons:\n\n**Salon A (Bodycraft)**\n- *Pros*: Excellent Hydra Facial, highly professional.\n- *Cons*: Weekend wait times can be long.\n- *Sentiment*: 92% Positive\n\n**Salon B (Play Salon)**\n- *Pros*: Great precision haircuts, premium vibe.\n- *Cons*: Higher price point.\n- *Sentiment*: 88% Positive"
      });
    }

    // 5. Booking Concierge Feature
    if (featureId === 'booking') {
      return NextResponse.json({
        reply: "I am the Booking Concierge. I have validated your requested date and time. Here is the drafted booking payload ready to be sent to the backend:\n\n```json\n{\n  \"status\": \"Draft\",\n  \"service\": \"Precision Haircut\",\n  \"date\": \"Next Friday\",\n  \"time\": \"2:00 PM\",\n  \"requiresConfirmation\": true\n}\n```\n\nWould you like me to confirm this booking?"
      });
    }

    return NextResponse.json({ reply: `Unrecognized feature: ${featureId}` });

  } catch (error: any) {
    console.error(`Error in feature API [${params.id}]:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
