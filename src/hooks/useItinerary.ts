import { useState } from 'react';
import { apiRequest } from '@/lib/api';

export interface ItineraryActivity {
  time: string;
  activity: string;
  description: string;
  location: string;
  duration: string;
  cost: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  morning: ItineraryActivity;
  afternoon: ItineraryActivity;
  evening: ItineraryActivity;
  tip: string;
}

export interface Itinerary {
  destination: string;
  nb_days: number;
  days: ItineraryDay[];
  total_estimated_cost: string;
  best_transport: string;
  general_tips: string;
}

export const useItinerary = () => {
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateItinerary = async (
    destination: string,
    nb_days: number,
    budget?: number,
    interests?: string[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/itinerary/generate', {
        method: 'POST',
        body: JSON.stringify({ destination, nb_days, budget, interests }),
      });
      setItinerary(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveItinerary = async (saved_destination_id: number, itinerary: Itinerary, nb_days: number) => {
    try {
      await apiRequest('/itinerary/save', {
        method: 'POST',
        body: JSON.stringify({ saved_destination_id, itinerary, nb_days }),
      });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const fetchItinerary = async (saved_destination_id: number) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/itinerary/${saved_destination_id}`);
      if (data.itinerary) {
        setItinerary(data.itinerary);
      }
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearItinerary = () => {
    setItinerary(null);
    setError(null);
  };

return {
  itinerary,
  loading,
  error,
  generateItinerary,
  saveItinerary,
  fetchItinerary,
  clearItinerary,
  setItinerary,
};
};
