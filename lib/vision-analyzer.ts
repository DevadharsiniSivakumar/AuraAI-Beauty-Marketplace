export interface BeautyProfileAnalysis {
  faceShape: string;
  hairType: string;
  hairDensity: string;
  skinTone: string;
  undertone: string;
  beautySummary: string;
  recommendedHairstyles: string[];
  recommendedTreatments: string[];
  recommendedMakeupStyles: string[];
  error?: string;
}

/**
 * Multi-provider vision analyzer.
 * Checks for API keys: GEMINI_API_KEY/GOOGLE_API_KEY, GROQ_API_KEY, OPENAI_API_KEY.
 * Falls back to Groq Llama-3.2 Vision since GROQ_API_KEY is available.
 */
export async function analyzeSelfieImage(base64Image: string): Promise<BeautyProfileAnalysis> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Prepare standard base64 image data prefix if missing
  let base64Data = base64Image;
  let mimeType = 'image/jpeg';
  if (base64Image.startsWith('data:')) {
    const match = base64Image.match(/^data:([^;]+);base64,/);
    if (match) {
      mimeType = match[1];
    }
    base64Data = base64Image.replace(/^data:[^;]+;base64,/, '');
  }

  const promptText = `You are a professional dermatological and hair care AI vision engine.
Analyze the uploaded selfie image and extract:
1. Face Shape (e.g. Oval, Round, Square, Heart, Oblong, Diamond)
2. Hair Type (e.g. 1A Straight, 2C Wavy, 3B Curly, 4C Coily)
3. Hair Density (e.g. Low, Medium, High)
4. Skin Tone (e.g. Fair, Medium, Olive, Deep, Bronze)
5. Skin Undertone (e.g. Cool, Warm, Neutral)
6. Beauty Profile Summary (An elegant 2-3 sentence luxury beauty description outlining features. Keep it positive and professional.)
7. Recommended Hairstyles (An array of exactly 3 suitable hairstyles)
8. Recommended Treatments (An array of exactly 3 suitable skin or hair salon treatments, e.g. Hydra Facial, Keratin Treatment, Hair Spa)
9. Recommended Makeup Styles (An array of exactly 3 suitable makeup styling/color suggestions)

CRITICAL IMAGE VALIDATION RULES:
Before returning analysis results, perform these checks:
- Verify that there is EXACTLY ONE human face clearly visible in the image.
- If there are zero faces, multiple faces, if the image is extremely blurry, or if the upload is not a human portrait, you must return a JSON response with ONLY an "error" field explaining the issue (e.g., {"error": "No face detected in the image. Please upload a clear selfie."} or {"error": "Multiple faces detected. Please upload a portrait with only one face."}).

You MUST respond with a single, valid JSON object. Do not wrap the JSON in markdown code blocks like \`\`\`json.
Your JSON response MUST follow this exact schema structure:
{
  "faceShape": string,
  "hairType": string,
  "hairDensity": string,
  "skinTone": string,
  "undertone": string,
  "beautySummary": string,
  "recommendedHairstyles": string[],
  "recommendedTreatments": string[],
  "recommendedMakeupStyles": string[],
  "error": string (optional, ONLY if validation fails)
}`;

  if (geminiKey) {
    try {
      console.log('Using Gemini Vision Provider...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  {
                    inlineData: {
                      mimeType: mimeType,
                      data: base64Data
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return JSON.parse(contentText.trim());
    } catch (err) {
      console.error('Gemini Vision Provider failed, trying next provider:', err);
    }
  }

  if (groqKey) {
    try {
      console.log('Using Groq Llama 4 Scout Vision Provider...');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: promptText
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 800,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API returned status ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const contentText = data.choices?.[0]?.message?.content || '';
      return JSON.parse(contentText.trim());
    } catch (err) {
      console.error('Groq Vision Provider failed, trying next provider:', err);
    }
  }

  if (openaiKey) {
    try {
      console.log('Using OpenAI Vision Provider...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: promptText
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`
                  }
                }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 800,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const contentText = data.choices?.[0]?.message?.content || '';
      return JSON.parse(contentText.trim());
    } catch (err) {
      console.error('OpenAI Vision Provider failed:', err);
    }
  }

  throw new Error('No vision providers were configured or succeeded.');
}
