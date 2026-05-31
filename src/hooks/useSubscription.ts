import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

export interface Plan {
  id: number;
  name: string;
  max_searches: number;
  max_saved: number;
  max_chat_messages: number;
  max_itineraries: number;
  max_checklists: number;
  max_budgets: number;
  has_history: boolean;
}

export interface Usage {
  searches: number;
  chat_messages: number;
  itineraries: number;
  checklists: number;
  budgets: number;
  saved: number;
}

export interface SubscriptionInfo {
  plan: Plan;
  usage: Usage;
  started_at: string;
  expires_at: string | null;
  period_start: string;
  period_end: string;
}

export const useSubscription = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const fetchSubscriptionInfo = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/subscription/info');
      setSubscriptionInfo(data);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await apiRequest('/subscription/plans');
      setPlans(data.plans);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  };

  const changePlan = async (plan_name: string) => {
    setUpgrading(true);
    try {
      const data = await apiRequest('/subscription/change', {
        method: 'POST',
        body: JSON.stringify({ plan_name }),
      });
      await fetchSubscriptionInfo();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      setUpgrading(false);
    }
  };

  const formatLimit = (value: number) => value === -1 ? 'Unlimited' : value;

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  return {
    subscriptionInfo,
    plans,
    loading,
    upgrading,
    fetchSubscriptionInfo,
    fetchPlans,
    changePlan,
    formatLimit,
    getUsagePercentage,
  };
};