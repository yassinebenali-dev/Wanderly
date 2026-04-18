import { useState } from 'react';
import { apiRequest } from '@/lib/api';

export interface Rating {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  display_name: string | null;
  email: string;
}

export interface RatingsData {
  ratings: Rating[];
  avg_rating: string | null;
  total: number;
}

export const useRatings = () => {
  const [ratingsData, setRatingsData] = useState<RatingsData | null>(null);
  const [userRating, setUserRating] = useState<{ id: number; rating: number; comment: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = async (destination: string) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/ratings/${encodeURIComponent(destination)}`);
      setRatingsData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRating = async (destination: string) => {
    try {
      const data = await apiRequest(`/ratings/user/${encodeURIComponent(destination)}`);
      setUserRating(data.userRating);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const submitRating = async (destination: string, rating: number, comment: string) => {
    try {
      await apiRequest('/ratings', {
        method: 'POST',
        body: JSON.stringify({ destination, rating, comment }),
      });
      await fetchRatings(destination);
      await fetchUserRating(destination);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const deleteRating = async (destination: string) => {
    try {
      await apiRequest(`/ratings/${encodeURIComponent(destination)}`, { method: 'DELETE' });
      setUserRating(null);
      await fetchRatings(destination);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    ratingsData,
    userRating,
    loading,
    error,
    fetchRatings,
    fetchUserRating,
    submitRating,
    deleteRating,
  };
};