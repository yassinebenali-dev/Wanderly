import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

interface Place {
  id: string;
  name: string;
  type: string;
  category: string;
  rating: number;
  reviewCount: number;
  priceLevel: number;
  price: string;
  image: string;
  description: string;
  address: string;
  distance?: string;
  openingHours?: string;
  tags: string[];
}

interface Recommendations {
  destination: string;
  accommodations: Place[];
  restaurants: Place[];
  activities: Place[];
  landmarks: Place[];
  history: {
    title: string;
    content: string;
    traditions: { name: string; description: string }[];
  };
}

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecommendations = useCallback(async (destination: string, preferences?: { budget?: number; interests?: string[] }) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          destination,
          budget: preferences?.budget,
          interests: preferences?.interests,
        }),
      });

      setRecommendations(data);

      toast({
        title: 'Recommendations loaded!',
        description: `Discovered ${data.accommodations?.length || 0} stays, ${data.restaurants?.length || 0} restaurants, and more for ${destination}`,
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch recommendations';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
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