import { useState } from 'react';
import { apiRequest } from '@/lib/api';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface ChecklistCategory {
  name: string;
  icon: string;
  items: ChecklistItem[];
}

export interface Checklist {
  categories: ChecklistCategory[];
}

export const useChecklist = () => {
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateChecklist = async (
    destination: string,
    interests?: string[],
    budget?: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/checklist/generate', {
        method: 'POST',
        body: JSON.stringify({ destination, interests, budget }),
      });
      setChecklist(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveChecklist = async (saved_destination_id: number, items: Checklist) => {
    try {
      await apiRequest('/checklist/save', {
        method: 'POST',
        body: JSON.stringify({ saved_destination_id, items }),
      });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const fetchChecklist = async (saved_destination_id: number) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/checklist/${saved_destination_id}`);
      if (data.items) {
        setChecklist(data.items);
      }
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (categoryName: string, itemId: string) => {
    if (!checklist) return;
    setChecklist({
      categories: checklist.categories.map(cat => {
        if (cat.name !== categoryName) return cat;
        return {
          ...cat,
          items: cat.items.map(item =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      }),
    });
  };

  const clearChecklist = () => {
    setChecklist(null);
    setError(null);
  };

  const setChecklistData = (data: Checklist) => {
    setChecklist(data);
  };

  return {
    checklist,
    loading,
    error,
    generateChecklist,
    saveChecklist,
    fetchChecklist,
    toggleItem,
    clearChecklist,
    setChecklistData,
  };
};