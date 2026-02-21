import { useState, useCallback } from 'react';
import { Place, CityHistory, UserPreferences } from '@/types/travel';
import { useToast } from '@/hooks/use-toast';

interface Recommendations {
  destination: string;
  accommodations: Place[];
  restaurants: Place[];
  activities: Place[];
  landmarks: Place[];
  history: CityHistory;
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecommendations = useCallback(async (destination: string, preferences?: UserPreferences) => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to get real data from SerpAPI
      let response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/serpapi-places`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ 
            destination,
            budget: preferences?.budget,
            interests: preferences?.interests,
          }),
        }
      );

      // Fallback to AI-generated recommendations if SerpAPI fails
      if (!response.ok) {
        console.log('SerpAPI failed, falling back to AI recommendations');
        response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-recommendations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ 
              destination,
              budget: preferences?.budget,
              interests: preferences?.interests,
            }),
          }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch recommendations`);
      }

      const data = await response.json();
      setRecommendations(data);
      
      toast({
        title: "Recommendations loaded!",
        description: `Discovered ${data.accommodations?.length || 0} stays, ${data.restaurants?.length || 0} restaurants, and more for ${destination}`,
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recommendations';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const clearRecommendations = useCallback(() => {
    setRecommendations(null);
    setError(null);
  }, []);

  return {
    recommendations,
    isLoading,
    error,
    fetchRecommendations,
    clearRecommendations,
  };
}
