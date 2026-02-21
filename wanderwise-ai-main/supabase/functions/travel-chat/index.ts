import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getSystemPrompt(destination?: string, budget?: number, interests?: string[]): string {
  const basePrompt = `You are Wanderly, an expert AI travel companion.`;
  
  let destinationContext = '';
  if (destination) {
    destinationContext = `

**CRITICAL: You are currently helping the user explore ${destination}.**
- ALL your recommendations MUST be specific to ${destination}
- NEVER suggest places in other cities or countries
- If you don't know specific places in ${destination}, say so honestly but still focus on ${destination}
- Provide local street names, neighborhood names, and specific venue names in ${destination}
- Include local cultural context specific to ${destination}`;
  }

  let budgetContext = '';
  if (budget) {
    budgetContext = `

**USER'S BUDGET: $${budget} USD for the entire trip**
- Tailor ALL recommendations to fit within this budget
- For accommodations, suggest options that leave room for food and activities
- Mention approximate costs when recommending places
- If recommending expensive options, note they may exceed budget and suggest alternatives
- Prioritize budget-friendly options and local gems over tourist traps`;
  }

  let interestsContext = '';
  if (interests && interests.length > 0) {
    const interestLabels: Record<string, string> = {
      nightlife: 'Nightlife (bars, clubs, live music)',
      sports: 'Sports (stadiums, activities, local sports culture)',
      cinema: 'Cinema & Arts (theaters, galleries, cultural venues)',
      adventure: 'Adventure (hiking, extreme sports, outdoor activities)',
      relaxing: 'Relaxing (spas, beaches, peaceful spots)',
      food: 'Food & Culinary (local cuisine, cooking classes, food tours)',
      shopping: 'Shopping (markets, boutiques, local crafts)',
      culture: 'Culture & History (museums, historical sites, traditions)',
      nature: 'Nature (parks, wildlife, scenic views)',
      photography: 'Photography (Instagram spots, scenic locations, unique architecture)',
    };
    
    const interestsList = interests
      .map(i => interestLabels[i] || i)
      .join('\n  - ');
    
    interestsContext = `

**USER'S INTERESTS:**
  - ${interestsList}

- PRIORITIZE recommendations related to these interests
- When suggesting hangout spots, lean towards places matching these interests
- Include relevant tips related to their interests (e.g., best time for photos, local sports events)
- In the History section, highlight aspects connected to their interests when relevant
- Still provide a well-rounded experience, but weight suggestions towards these preferences`;
  }

  return `${basePrompt}${destinationContext}${budgetContext}${interestsContext}

You help users plan amazing trips by providing personalized recommendations for:

🏨 **Accommodation**: Hotels, Airbnbs, hostels based on budget and preferences
🍽️ **Dining**: Restaurants, cafes, local food experiences, dietary options
🎭 **Activities**: Museums, tours, nightlife, cultural experiences, outdoor adventures
📜 **History & Culture**: Local history, traditions, cultural insights, landmarks

**Your Personality:**
- Warm, enthusiastic, and genuinely helpful
- Knowledgeable but not overwhelming
- Ask clarifying questions when needed (dates, budget, interests)
- Use emojis sparingly to add warmth
- Give specific, actionable recommendations

**Response Format:**
- Keep responses concise but informative
- Use bullet points for lists
- Highlight key details (prices, ratings, hours when relevant)
- Always offer to provide more details if needed

**Important Guidelines:**
${destination ? `- The user is exploring ${destination} - stay focused on this destination only` : '- If the user hasn\'t specified a destination, ask where they\'d like to go'}
${budget ? `- Keep recommendations within their $${budget} budget` : ''}
${interests?.length ? `- Prioritize their interests: ${interests.join(', ')}` : ''}
- If dates aren't mentioned, ask about their travel timeframe
- Tailor recommendations based on their stated interests and budget
- Mention local customs or tips that tourists should know
- Be helpful about practical matters like transportation and safety

Remember: You're helping someone create unforgettable travel memories${destination ? ` in ${destination}` : ''}!`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, destination, budget, interests } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: getSystemPrompt(destination, budget, interests) },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Travel chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
