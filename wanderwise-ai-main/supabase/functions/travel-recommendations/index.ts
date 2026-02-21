import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RECOMMENDATIONS_PROMPT = `You are a travel data API that returns structured JSON data for travel recommendations. Given a destination, generate realistic and helpful travel data.

IMPORTANT: You must respond ONLY with valid JSON, no markdown, no code blocks, no explanations.

Generate data for the destination with this exact structure:
{
  "destination": "City Name, Country",
  "accommodations": [
    {
      "id": "acc-1",
      "name": "Hotel Name",
      "type": "accommodation",
      "category": "Luxury Hotel|Boutique Hotel|Airbnb|Hostel",
      "rating": 4.5,
      "reviewCount": 1000,
      "priceLevel": 1-4,
      "price": "$XX/night",
      "image": "unsplash URL for hotel image",
      "description": "Brief compelling description",
      "address": "Full address",
      "distance": "X.X km from center",
      "tags": ["Pool", "Spa", "WiFi", etc]
    }
  ],
  "restaurants": [
    {
      "id": "rest-1",
      "name": "Restaurant Name",
      "type": "restaurant",
      "category": "Cuisine Type",
      "rating": 4.5,
      "reviewCount": 500,
      "priceLevel": 1-3,
      "price": "$|$$|$$$",
      "image": "unsplash URL for food/restaurant",
      "description": "Brief description of the food and atmosphere",
      "address": "Address",
      "distance": "X.X km",
      "openingHours": "XX:XX AM - XX:XX PM",
      "tags": ["Italian", "Romantic", "Outdoor", etc]
    }
  ],
  "activities": [
    {
      "id": "act-1",
      "name": "Activity/Attraction Name",
      "type": "activity",
      "category": "Museum|Tour|Adventure|Nightlife|Entertainment",
      "rating": 4.5,
      "reviewCount": 2000,
      "priceLevel": 1-3,
      "price": "$XX or Free",
      "image": "unsplash URL",
      "description": "What visitors can expect",
      "address": "Address",
      "distance": "X.X km",
      "openingHours": "Hours of operation",
      "tags": ["Family-Friendly", "Outdoor", "Historic", etc]
    }
  ],
  "landmarks": [
    {
      "id": "land-1",
      "name": "Landmark Name",
      "type": "landmark",
      "category": "Historic Site|Park|Religious Site|Monument",
      "rating": 4.7,
      "reviewCount": 5000,
      "priceLevel": 1,
      "price": "Free or $XX",
      "image": "unsplash URL of the landmark",
      "description": "Historical significance and what to see",
      "address": "Address",
      "distance": "X.X km",
      "openingHours": "Hours",
      "tags": ["Historic", "Photography", "Free", etc]
    }
  ],
  "history": {
    "title": "The Story of [Destination]",
    "content": "2-3 paragraphs about the city's history, founding, major historical events, and cultural significance. Make it engaging and informative.",
    "traditions": [
      {
        "name": "Tradition Name",
        "description": "Brief description of the local tradition or custom"
      }
    ]
  }
}

Generate 4 items each for accommodations, restaurants, activities, and landmarks.
Use realistic Unsplash image URLs in this format: https://images.unsplash.com/photo-XXXXX?w=800&q=80
Make all recommendations authentic to the destination's culture and offerings.
Include 3 traditions in the history section.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination } = await req.json();

    if (!destination) {
      return new Response(
        JSON.stringify({ error: "Destination is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
          { role: "system", content: RECOMMENDATIONS_PROMPT },
          { role: "user", content: `Generate comprehensive travel recommendations for: ${destination}` },
        ],
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
      return new Response(JSON.stringify({ error: "Failed to get recommendations" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response - handle potential markdown code blocks
    let recommendations;
    try {
      // Remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      recommendations = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid JSON response from AI");
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
