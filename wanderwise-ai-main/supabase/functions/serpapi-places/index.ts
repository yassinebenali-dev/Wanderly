import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERPAPI_BASE_URL = "https://serpapi.com/search.json";

function getHistoryPrompt(interests?: string[]): string {
  let interestContext = '';
  if (interests && interests.length > 0) {
    const interestLabels: Record<string, string> = {
      nightlife: 'nightlife and entertainment scene',
      sports: 'sports culture and history',
      cinema: 'film and arts heritage',
      adventure: 'adventure and exploration history',
      relaxing: 'wellness and relaxation traditions',
      food: 'culinary heritage and food culture',
      shopping: 'markets and trade history',
      culture: 'cultural and historical significance',
      nature: 'natural environment and conservation',
      photography: 'iconic landmarks and visual culture',
    };
    
    const relevantAspects = interests
      .map(i => interestLabels[i])
      .filter(Boolean)
      .join(', ');
    
    interestContext = `

The user is particularly interested in: ${interests.join(', ')}.
When writing about traditions and history, try to include information related to: ${relevantAspects}.
Make sure to highlight any aspects of the city's history or traditions that connect to these interests.`;
  }

  return `You are a travel historian. Given a destination, provide historical and cultural information.${interestContext}

IMPORTANT: Respond ONLY with valid JSON, no markdown, no code blocks.

Return this exact structure:
{
  "title": "The Story of [Destination]",
  "content": "2-3 paragraphs about the city's history, founding, major events, and cultural significance.",
  "traditions": [
    { "name": "Tradition Name", "description": "Brief description" }
  ]
}

Include exactly 3 traditions${interests?.length ? ', prioritizing those related to the user\'s interests' : ''}.`;
}

function getAccommodationPrompt(budget?: number): string {
  let budgetContext = '';
  if (budget) {
    const perNightBudget = Math.round(budget * 0.4 / 5); // 40% of budget for 5 nights
    budgetContext = `

The user has a total trip budget of $${budget} USD. 
Suggest accommodations with nightly rates that fit within roughly $${perNightBudget} per night (assuming 40% of budget for accommodation over 5 nights).
Include a mix of budget-friendly and mid-range options that fit within this constraint.
Always mention the approximate nightly rate in the description.`;
  }

  return `You are a travel accommodation expert. Given a destination, provide 6 hotel/accommodation recommendations.${budgetContext}

IMPORTANT: Respond ONLY with valid JSON, no markdown, no code blocks.

Return this exact structure:
{
  "accommodations": [
    {
      "name": "Hotel Name",
      "category": "Luxury Hotel",
      "rating": 4.8,
      "reviewCount": 1250,
      "priceLevel": 3,
      "price": "$$$",
      "description": "Brief compelling description${budget ? ' including approximate nightly rate' : ''}",
      "address": "Full address",
      "tags": ["Tag1", "Tag2"]
    }
  ]
}

Include exactly 6 accommodations${budget ? ' prioritizing options within the budget' : ' with varied price levels (budget to luxury)'}.`;
}

interface SerpApiPlace {
  position: number;
  title: string;
  type?: string;
  rating?: number;
  reviews?: number;
  reviews_original?: string;
  price?: string;
  description?: string;
  address?: string;
  hours?: string;
  thumbnail?: string;
  lsig?: string;
  place_id?: string;
  gps_coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface TransformedPlace {
  id: string;
  name: string;
  type: 'accommodation' | 'restaurant' | 'activity' | 'landmark';
  category: string;
  rating: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3 | 4;
  price: string;
  image: string;
  description: string;
  address: string;
  distance?: string;
  openingHours?: string;
  link: string;
  tags: string[];
}

interface CityHistory {
  title: string;
  content: string;
  traditions: { name: string; description: string }[];
}

function parsePriceLevel(price?: string): 1 | 2 | 3 | 4 {
  if (!price) return 2;
  const dollarCount = (price.match(/\$/g) || []).length;
  const euroCount = (price.match(/€/g) || []).length;
  const count = Math.max(dollarCount, euroCount);
  
  if (price.includes('€1–10') || price.includes('$1–10') || count <= 1) return 1;
  if (price.includes('€10–20') || price.includes('$10–20') || count === 2) return 2;
  if (price.includes('€20–30') || price.includes('$20–30') || price.includes('€20–40') || count === 3) return 3;
  if (price.includes('€30–50') || price.includes('$30–50') || count >= 4) return 4;
  
  return 2;
}

function generateTags(place: SerpApiPlace, category: string): string[] {
  const tags: string[] = [];
  
  if (place.type) tags.push(place.type);
  if (place.rating && place.rating >= 4.7) tags.push("Highly Rated");
  if (place.reviews && place.reviews >= 5000) tags.push("Popular");
  if (place.price?.includes("€1–10") || place.price === "$") tags.push("Budget-Friendly");
  if (place.price?.includes("€30") || place.price === "$$$") tags.push("Upscale");
  
  if (category === 'restaurant') {
    if (place.description?.toLowerCase().includes('romantic')) tags.push("Romantic");
    if (place.description?.toLowerCase().includes('outdoor')) tags.push("Outdoor Seating");
    if (place.description?.toLowerCase().includes('family')) tags.push("Family-Friendly");
  }
  
  return tags.slice(0, 4);
}

// High-quality fallback images by category
const fallbackImages = {
  restaurant: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=90",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=90",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=90",
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200&q=90",
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&q=90",
  ],
  activity: [
    "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=90",
    "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1200&q=90",
    "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200&q=90",
    "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1200&q=90",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=90",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=90",
  ],
  landmark: [
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=90",
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=90",
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=90",
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=90",
    "https://images.unsplash.com/photo-1431274172761-fca41d930114?w=1200&q=90",
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=90",
  ],
  accommodation: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=90",
  ],
};

function getHighQualityImage(thumbnail: string | undefined, type: string, index: number): string {
  if (thumbnail) {
    if (thumbnail.includes('googleusercontent.com')) {
      return thumbnail.replace(/=w\d+/, '=w800').replace(/=h\d+/, '=h600');
    }
    return thumbnail;
  }
  
  const images = fallbackImages[type as keyof typeof fallbackImages] || fallbackImages.activity;
  return images[index % images.length];
}

function generatePlaceLink(place: SerpApiPlace, type: string, destination: string): string {
  if (type === 'activity' || type === 'landmark') {
    const searchQuery = encodeURIComponent(`${place.title} ${destination}`);
    return `https://en.wikipedia.org/wiki/Special:Search?search=${searchQuery}`;
  }
  
  const searchQuery = encodeURIComponent(`${place.title} ${destination} official site`);
  return `https://www.google.com/search?q=${searchQuery}&btnI=1`;
}

function transformPlace(
  place: SerpApiPlace, 
  type: 'accommodation' | 'restaurant' | 'activity' | 'landmark',
  index: number,
  destination: string = ''
): TransformedPlace {
  return {
    id: `${type}-${place.place_id || index}`,
    name: place.title,
    type,
    category: place.type || type,
    rating: place.rating || 4.0,
    reviewCount: place.reviews || 0,
    priceLevel: parsePriceLevel(place.price),
    price: place.price || "$$",
    image: getHighQualityImage(place.thumbnail, type, index),
    description: place.description?.replace(/^"|"$/g, '') || `Discover ${place.title} in the heart of the city.`,
    address: place.address || "Address not available",
    link: generatePlaceLink(place, type, destination),
    openingHours: place.hours,
    tags: generateTags(place, type),
  };
}

async function fetchFromSerpApi(query: string, apiKey: string): Promise<SerpApiPlace[]> {
  const url = new URL(SERPAPI_BASE_URL);
  url.searchParams.set("engine", "google_local");
  url.searchParams.set("q", query);
  url.searchParams.set("google_domain", "google.com");
  url.searchParams.set("hl", "en");
  url.searchParams.set("gl", "us");
  url.searchParams.set("api_key", apiKey);

  console.log(`Fetching from SerpAPI: ${query}`);
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`SerpAPI error: ${response.status}`, errorText);
    throw new Error(`SerpAPI request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.local_results || [];
}

async function fetchAccommodations(destination: string, lovableApiKey: string, budget?: number): Promise<TransformedPlace[]> {
  console.log(`Generating AI accommodations for: ${destination} with budget: ${budget}`);
  
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: getAccommodationPrompt(budget) },
          { role: "user", content: `Provide accommodation recommendations for: ${destination}` },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error for accommodations:", response.status);
      throw new Error("Failed to fetch accommodations");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) throw new Error("No content in AI response");

    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) cleanContent = cleanContent.slice(7);
    else if (cleanContent.startsWith("```")) cleanContent = cleanContent.slice(3);
    if (cleanContent.endsWith("```")) cleanContent = cleanContent.slice(0, -3);
    
    const parsed = JSON.parse(cleanContent.trim());
    
    return parsed.accommodations.map((acc: any, i: number) => {
      const searchQuery = encodeURIComponent(`${acc.name} ${destination} official website`);
      return {
        id: `accommodation-${i}`,
        name: acc.name,
        type: 'accommodation' as const,
        category: acc.category,
        rating: acc.rating,
        reviewCount: acc.reviewCount,
        priceLevel: acc.priceLevel,
        price: acc.price,
        image: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=90`,
        description: acc.description,
        address: acc.address,
        link: `https://www.google.com/search?q=${searchQuery}&btnI=1`,
        tags: acc.tags,
      };
    });
  } catch (error) {
    console.error("Accommodations fetch error:", error);
    return [];
  }
}

async function fetchHistory(destination: string, lovableApiKey: string, interests?: string[]): Promise<CityHistory> {
  console.log(`Fetching history for: ${destination} with interests: ${interests?.join(', ')}`);
  
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: getHistoryPrompt(interests) },
          { role: "user", content: `Provide historical and cultural information about: ${destination}` },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error for history:", response.status);
      throw new Error("Failed to fetch history");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.slice(7);
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.slice(3);
    }
    if (cleanContent.endsWith("```")) {
      cleanContent = cleanContent.slice(0, -3);
    }
    
    return JSON.parse(cleanContent.trim());
  } catch (error) {
    console.error("History fetch error:", error);
    return {
      title: `Discover ${destination}`,
      content: `${destination} is a fascinating destination with a rich history and vibrant culture. Explore its streets to uncover centuries of stories, traditions, and architectural marvels that make it unique.`,
      traditions: [
        { name: "Local Cuisine", description: "Experience authentic flavors passed down through generations." },
        { name: "Festivals", description: "Join locals in celebrating time-honored cultural events." },
        { name: "Craftsmanship", description: "Discover traditional arts and handmade goods." },
      ],
    };
  }
}

// Build activity search query based on user interests
function getActivitySearchQuery(destination: string, interests?: string[]): string {
  if (!interests || interests.length === 0) {
    return `things to do in ${destination}`;
  }

  // Map interests to search terms
  const interestSearchTerms: Record<string, string> = {
    nightlife: 'nightlife bars clubs',
    sports: 'sports activities stadiums',
    cinema: 'theaters museums arts',
    adventure: 'adventure outdoor activities',
    relaxing: 'spa wellness relaxation',
    food: 'food tours cooking classes',
    shopping: 'shopping markets boutiques',
    culture: 'cultural tours museums',
    nature: 'parks nature trails',
    photography: 'scenic viewpoints landmarks',
  };

  // Get relevant search terms for first 2 interests
  const relevantTerms = interests
    .slice(0, 2)
    .map(i => interestSearchTerms[i])
    .filter(Boolean)
    .join(' ');

  return relevantTerms 
    ? `${relevantTerms} in ${destination}`
    : `things to do in ${destination}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, budget, interests } = await req.json();

    if (!destination) {
      return new Response(
        JSON.stringify({ error: "Destination is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const SERPAPI_API_KEY = Deno.env.get("SERPAPI_API_KEY");
    if (!SERPAPI_API_KEY) {
      throw new Error("SERPAPI_API_KEY is not configured");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build activity query based on interests
    const activityQuery = getActivitySearchQuery(destination, interests);

    // Fetch places from SerpAPI and AI-generated content in parallel
    const [accommodations, restaurantsResults, activitiesResults, landmarksResults, history] = await Promise.all([
      fetchAccommodations(destination, LOVABLE_API_KEY, budget),
      fetchFromSerpApi(`restaurants in ${destination}`, SERPAPI_API_KEY),
      fetchFromSerpApi(activityQuery, SERPAPI_API_KEY),
      fetchFromSerpApi(`landmarks in ${destination}`, SERPAPI_API_KEY),
      fetchHistory(destination, LOVABLE_API_KEY, interests),
    ]);

    // Transform and limit SerpAPI results
    const restaurants = restaurantsResults
      .slice(0, 6)
      .map((place, i) => transformPlace(place, 'restaurant', i, destination));
    
    const activities = activitiesResults
      .slice(0, 6)
      .map((place, i) => transformPlace(place, 'activity', i, destination));
    
    const landmarks = landmarksResults
      .slice(0, 6)
      .map((place, i) => transformPlace(place, 'landmark', i, destination));

    const response = {
      destination,
      accommodations,
      restaurants,
      activities,
      landmarks,
      history,
      dataSource: "serpapi",
      userPreferences: { budget, interests },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("SerpAPI places error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
