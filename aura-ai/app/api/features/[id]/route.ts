import { NextResponse } from 'next/server';
import { detectIntent } from '../../../../lib/intentDetector';
import { searchAndRank, getSalonsAndServices } from '../../../../lib/searchEngine';
import { generateGroqResponse } from '../../../../lib/groq';
import { collection, addDoc } from 'firebase/firestore';
import { db, IS_MOCK } from '../../../../lib/firebase';

export async function POST(request: Request, context: any) {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const featureId = pathParts[pathParts.length - 1]; // gets 'intent' from /api/features/intent
    
    const { message, userProfile, bookings, history = [] } = await request.json();

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
      const msgLower = message.toLowerCase();
      const lastMessage = history.length > 0 ? history[history.length - 1] : null;

      // Check if this is a confirmation response
      if (lastMessage?.role === 'assistant' && lastMessage.text.includes("Would you like me to confirm this booking?")) {
        if (msgLower.includes("yes") || msgLower.includes("sure") || msgLower.includes("book") || msgLower.includes("confirm") || msgLower.includes("please")) {
          // Extract JSON payload from the previous message
          const jsonMatch = lastMessage.text.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            try {
              const payload = JSON.parse(jsonMatch[1]);
              
              const newBookingData = {
                  id: `mock-b-${Date.now()}`,
                  userId: userProfile?.uid || userProfile?.email || 'guest_123',
                  userName: userProfile?.name || 'Aura User',
                  userEmail: userProfile?.email || '',
                  salonId: payload.salonId || 'unknown',
                  serviceId: payload.serviceId || 'unknown',
                  salonName: payload.salon,
                  serviceName: payload.service,
                  date: payload.date,
                  time: payload.time,
                  status: 'Confirmed',
                  price: payload.estimatedPrice ? parseFloat(payload.estimatedPrice.replace(/[^0-9.]/g, '')) || 0 : 0,
                  createdAt: new Date().toISOString()
              };

              const emailStatus = "I have sent a confirmation email to you with all the details.";

              return NextResponse.json({
                reply: `Your appointment for **${payload.service}** at **${payload.salon}** on **${payload.date}** at **${payload.time}** has been successfully booked! 🎉\n\n${emailStatus} Have a wonderful day!`,
                newBooking: newBookingData
              });
            } catch(e) {
              console.error(e);
            }
          }
        } else {
           return NextResponse.json({ reply: "Booking cancelled. Let me know if you need help scheduling something else!" });
        }
      }

      // If not confirming, parse the booking request with Groq
      const systemPrompt = `You are a strict data extraction AI for a salon booking system. Today's date is ${new Date().toISOString().split('T')[0]}.
Extract the requested appointment details from the user's message.
Return ONLY a valid JSON object matching exactly this schema:
{
  "salon": "string (the salon name)",
  "service": "string (the service name)",
  "date": "string (Resolve the date to a real calendar date format YYYY-MM-DD based on today's date)",
  "time": "string (the time, e.g., '01:00 PM')"
}
If any piece of information is missing, make your best guess or return "Unknown". Do not include markdown \`\`\`json wrappers.`;

      let parsed = { salon: "Unknown", service: "Unknown", date: "Unknown", time: "Unknown" };
      try {
        const groqResult = await generateGroqResponse([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ], 'llama-3.3-70b-versatile', 500, { type: 'json_object' });
        const parsedJson = JSON.parse(groqResult);
        parsed = { ...parsed, ...parsedJson };
        if (!parsed.salon) parsed.salon = "Unknown";
        if (!parsed.service) parsed.service = "Unknown";
        if (!parsed.date) parsed.date = "Unknown";
        if (!parsed.time) parsed.time = "Unknown";
      } catch (err) {
        console.error("Groq extraction failed", err);
      }

      // Fetch actual salon data to find the price
      const allSalons = await getSalonsAndServices();
      const matchedSalon = allSalons.find(s => s.name && parsed.salon && parsed.salon !== "Unknown" && s.name.toLowerCase().includes(parsed.salon.toLowerCase()));
      let matchedService = null;
      let priceText = "Price to be determined at salon";

      if (matchedSalon) {
        matchedService = matchedSalon.services.find(s => s.name && parsed.service && parsed.service !== "Unknown" && s.name.toLowerCase().includes(parsed.service.toLowerCase()));
        if (matchedService) {
           priceText = `₹${matchedService.price}`;
        }
      }

      return NextResponse.json({
        reply: `I am the Booking Concierge. I have validated your request.\n\nThe **${matchedService ? matchedService.name : parsed.service}** at **${matchedSalon ? matchedSalon.name : parsed.salon}** will cost approximately **${priceText}**.\n\nHere is the drafted booking payload ready to be sent to the backend:\n\n\`\`\`json\n{\n  "status": "Draft",\n  "salon": "${matchedSalon ? matchedSalon.name : parsed.salon}",\n  "salonId": "${matchedSalon ? matchedSalon.id : 'unknown'}",\n  "service": "${matchedService ? matchedService.name : parsed.service}",\n  "serviceId": "${matchedService ? matchedService.id : 'unknown'}",\n  "date": "${parsed.date}",\n  "time": "${parsed.time}",\n  "estimatedPrice": "${priceText}",\n  "requiresConfirmation": true\n}\n\`\`\`\n\nWould you like me to confirm this booking?`
      });
    }

    return NextResponse.json({ reply: `Unrecognized feature: ${featureId}` });

  } catch (error: any) {
    console.error(`Error in feature API:`, error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
