import { useState } from 'react';
import { apiRequest } from '@/lib/api';

export interface BudgetCategory {
  name: string;
  icon: string;
  allocated: number;
  color: string;
}

export interface Budget {
  total_budget: number;
  categories: BudgetCategory[];
}

const DEFAULT_CATEGORIES = (total: number): BudgetCategory[] => [
  { name: 'Accommodation', icon: '🏨', allocated: Math.round(total * 0.4), color: 'bg-blue-500' },
  { name: 'Food', icon: '🍽️', allocated: Math.round(total * 0.2), color: 'bg-orange-500' },
  { name: 'Transport', icon: '🚌', allocated: Math.round(total * 0.1), color: 'bg-green-500' },
  { name: 'Activities', icon: '🎯', allocated: Math.round(total * 0.15), color: 'bg-purple-500' },
  { name: 'Shopping', icon: '🛍️', allocated: Math.round(total * 0.1), color: 'bg-pink-500' },
  { name: 'Misc', icon: '📦', allocated: Math.round(total * 0.05), color: 'bg-gray-500' },
];

export const useBudget = () => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initBudget = (total: number) => {
    setBudget({
      total_budget: total,
      categories: DEFAULT_CATEGORIES(total),
    });
  };

  const fetchBudget = async (saved_destination_id: number) => {
    setLoading(true);
    try {
      const data = await apiRequest(`/budget/${saved_destination_id}`);
      if (data.budget !== null && data.total_budget) {
        setBudget({
          total_budget: data.total_budget,
          categories: data.categories,
        });
        return data;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveBudget = async (saved_destination_id: number, budgetData: Budget) => {
    try {
      await apiRequest('/budget/save', {
        method: 'POST',
        body: JSON.stringify({
          saved_destination_id,
          total_budget: budgetData.total_budget,
          categories: budgetData.categories,
        }),
      });
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const updateCategory = (name: string, amount: number) => {
    if (!budget) return;
    setBudget({
      ...budget,
      categories: budget.categories.map(cat =>
        cat.name === name ? { ...cat, allocated: amount } : cat
      ),
    });
  };

  const getTotalAllocated = () => {
    if (!budget) return 0;
    return budget.categories.reduce((sum, cat) => sum + cat.allocated, 0);
  };

  const getRemaining = () => {
    if (!budget) return 0;
    return budget.total_budget - getTotalAllocated();
  };

  const setBudgetData = (data: Budget) => {
    setBudget(data);
  };

  return {
    budget,
    loading,
    error,
    initBudget,
    fetchBudget,
    saveBudget,
    updateCategory,
    getTotalAllocated,
    getRemaining,
    setBudgetData,
  };
};