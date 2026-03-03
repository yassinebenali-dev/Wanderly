import { useState, useCallback } from 'react';
import { apiRequest, getToken } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/api';

export interface SavedDestination {
  id: number;
  destination: string;
  budget?: number;
  interests: string[];
  recommendations: any;
  created_at: string;
}

export function useSaved() {
  const [savedList, setSavedList] = useState<SavedDestination[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkIfSaved = useCallback(async (destination: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const data = await apiRequest(`/saved/check/${encodeURIComponent(destination)}`);
      setIsSaved(data.saved);
      setSavedId(data.id);
    } catch {
      setIsSaved(false);
    }
  }, []);

const saveDestination = useCallback(async (
    destination: string,
    recommendations: any,
    budget?: number,
    interests?: string[]
  ) => {
    const token = getToken();
    console.log('Token:', token); // temporary debug
    if (!token) {
      // Save pending data to localStorage before redirecting
      localStorage.setItem('wanderly_pending_save', JSON.stringify({
        destination,
        recommendations,
        budget,
        interests,
      }));
      toast({ title: 'Sign in required', description: 'Please sign in to save your trip' });
      window.location.href = '/auth';
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiRequest('/saved', {
        method: 'POST',
        body: JSON.stringify({ destination, budget, interests, recommendations }),
      });
      setIsSaved(true);
      setSavedId(data.id);
      toast({ title: 'Destination saved!', description: `${destination} added to your saved destinations` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const unsaveDestination = useCallback(async (id: number, destination: string) => {
    setIsLoading(true);
    try {
      await apiRequest(`/saved/${id}`, { method: 'DELETE' });
      setIsSaved(false);
      setSavedId(null);
      toast({ title: 'Removed', description: `${destination} removed from saved destinations` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchSavedDestinations = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await apiRequest('/saved');
      setSavedList(data);
    } catch (err) {
      console.error('Failed to fetch saved destinations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteFromList = useCallback(async (id: number) => {
    try {
      await apiRequest(`/saved/${id}`, { method: 'DELETE' });
      setSavedList(prev => prev.filter(item => item.id !== id));
      toast({ title: 'Removed', description: 'Destination removed from saved list' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  }, [toast]);

  return {
    savedList,
    isSaved,
    savedId,
    isLoading,
    checkIfSaved,
    saveDestination,
    unsaveDestination,
    fetchSavedDestinations,
    deleteFromList,
  };
}