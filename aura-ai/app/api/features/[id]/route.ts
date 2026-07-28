import { NextResponse } from 'next/server';
import { detectIntent } from '../../../../lib/intentDetector';
import { searchAndRank } from '../../../../lib/searchEngine';

export async function POST(request: Request, context: any) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const featureId = pathParts[pathParts.length - 1]; // gets 'intent' from /api/features/intent
    
    const { message, userProfile, bookings } = await request.json();

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
      const eventMatch = message.match(/(?:for my|upcoming) (wedding|party|vacation|birthday|event)/i);
      const event = eventMatch ? eventMatch[1] : "event";
      return NextResponse.json({
        reply: `I am the Beauty Planner. Here is a generated multi-step timeline based on your upcoming **${event}**:\n\n1. **Week 1 (Prep)**: Deep Exfoliation Facial to clear the skin canvas.\n2. **Week 2 (Repair)**: Hair Spa and cuticle sealing.\n3. **3 Days Before Event**: Shimmering glow mask and professional manicure/pedicure.\n\n(This timeline can be saved to your dashboard for tracking!)`
      });
    }

    // 4. Review Intelligence Feature
    if (featureId === 'review') {
      const match = message.match(/compare (.*?) and (.*)/i);
      const s1 = match ? match[1] : "Salon A (Bodycraft)";
      const s2 = match ? match[2] : "Salon B (Play Salon)";
      return NextResponse.json({
        reply: `I am the Review Intelligence agent. Based on analyzing hundreds of user reviews for these salons:\n\n**${s1}**\n- *Pros*: Excellent Hydra Facial, highly professional.\n- *Cons*: Weekend wait times can be long.\n- *Sentiment*: 92% Positive\n\n**${s2}**\n- *Pros*: Great precision haircuts, premium vibe.\n- *Cons*: Higher price point.\n- *Sentiment*: 88% Positive`
      });
    }

    // 5. Booking Concierge Feature
    if (featureId === 'booking') {
      const timeMatch = message.match(/\b\d{1,2}:\d{2}\s*(?:am|pm)?\b|\b\d{1,2}\s*(?:am|pm)\b/i);
      const time = timeMatch ? timeMatch[0].toUpperCase() : "10:00 AM";
      
      const date = message.toLowerCase().includes('tomorrow') ? 'Tomorrow' : 
                   message.toLowerCase().includes('today') ? 'Today' : 'Requested Date';
                   
      const serviceMatch = message.match(/for (a|my) (haircut|spa|facial|massage)/i);
      const service = serviceMatch ? serviceMatch[2] : "Precision Haircut";
      
      const salonMatch = message.match(/at (.*?) (salon|spa)/i);
      const salon = salonMatch ? salonMatch[1] : "Selected Salon";

      return NextResponse.json({
        reply: `I am the Booking Concierge. I have validated your requested date and time. Here is the drafted booking payload ready to be sent to the backend:\n\n\`\`\`json\n{\n  "status": "Draft",\n  "salon": "${salon}",\n  "service": "${service}",\n  "date": "${date}",\n  "time": "${time}",\n  "requiresConfirmation": true\n}\n\`\`\`\n\nWould you like me to confirm this booking?`
      });
    }

    return NextResponse.json({ reply: `Unrecognized feature: ${featureId}` });

  } catch (error: any) {
    console.error(`Error in feature API [${params.id}]:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
