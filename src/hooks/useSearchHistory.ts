import { useState } from 'react';
import { apiRequest } from '@/lib/api';

export interface SearchHistoryItem {
  id: number;
  destination: string;
  budget: number | null;
  interests: string[];
  searched_at: string;
}

export const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/search-history');
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch search history:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: number) => {
    try {
      await apiRequest(`/search-history/${id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const clearHistory = async () => {
    try {
      await apiRequest('/search-history', { method: 'DELETE' });
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  return {
    history,
    loading,
    fetchHistory,
    deleteEntry,
    clearHistory,
  };
};