export interface TravelPreferences {
  destination: string;
  arrivalDate: string;
  departureDate: string;
  budget?: number; // Maximum budget in USD
  interests?: string[];
}

export interface UserPreferences {
  budget?: number;
  interests: string[];
}

export interface Place {
  id: string;
  name: string;
  type: 'accommodation' | 'restaurant' | 'activity' | 'landmark';
  category?: string;
  rating: number;
  reviewCount: number;
  priceLevel: 1 | 2 | 3 | 4;
  price?: string;
  image: string;
  description: string;
  address: string;
  distance?: string;
  openingHours?: string;
  link?: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ItineraryDay {
  day: number;
  date: string;
  activities: ItineraryActivity[];
}

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  type: 'accommodation' | 'food' | 'activity' | 'transport';
  place?: Place;
}

export interface Tradition {
  name: string;
  description: string;
}

export interface CityHistory {
  title: string;
  content: string;
  traditions: Tradition[];
}

// Available interest options
export const INTEREST_OPTIONS = [
  { value: 'nightlife', label: 'Nightlife', emoji: '🎉' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'cinema', label: 'Cinema & Arts', emoji: '🎬' },
  { value: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { value: 'relaxing', label: 'Relaxing', emoji: '🧘' },
  { value: 'food', label: 'Food & Culinary', emoji: '🍽️' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'culture', label: 'Culture & History', emoji: '🏛️' },
  { value: 'nature', label: 'Nature', emoji: '🌿' },
  { value: 'photography', label: 'Photography', emoji: '📸' },
] as const;
