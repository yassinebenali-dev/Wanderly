import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChatMessage, UserPreferences, INTEREST_OPTIONS } from '@/types/travel';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-chat`;

interface UseTravelChatOptions {
  destination?: string;
  preferences?: UserPreferences;
}

interface UseTravelChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
}

function getInterestLabels(interests: string[]): string {
  return interests
    .map(i => INTEREST_OPTIONS.find(opt => opt.value === i)?.label)
    .filter(Boolean)
    .join(', ');
}

function getInitialMessage(destination?: string, preferences?: UserPreferences): ChatMessage {
  const interestLabels = preferences?.interests?.length 
    ? getInterestLabels(preferences.interests) 
    : '';
  
  if (destination) {
    let preferencesInfo = '';
    if (preferences?.budget || preferences?.interests?.length) {
      preferencesInfo = '\n\n**Your preferences:**\n';
      if (preferences?.budget) {
        preferencesInfo += `• 💰 Budget: $${preferences.budget}\n`;
      }
      if (preferences?.interests?.length) {
        preferencesInfo += `• ❤️ Interests: ${interestLabels}\n`;
      }
      preferencesInfo += '\nI\'ll tailor all my suggestions to match these!';
    }

    return {
      id: '1',
      role: 'assistant',
      content: `Hello! 🌍 I'm Wanderly, your AI travel companion for **${destination}**!

I'm ready to help you explore ${destination} with personalized recommendations for:
• 🏨 Accommodation (hotels, Airbnbs, hostels)
• 🍽️ Dining (restaurants, local street food, dietary options)
• 🎭 Activities (tours, nightlife, cultural experiences)
• 📜 History & Culture (landmarks, traditions)${preferencesInfo}

**What would you like to know about ${destination}?** Ask me anything—best neighborhoods, hidden gems, local food spots, or cultural tips!`,
      timestamp: new Date(),
    };
  }
  
  return {
    id: '1',
    role: 'assistant',
    content: `Hello! 🌍 I'm Wanderly, your AI travel companion! 

I'm here to help you plan an unforgettable trip with personalized recommendations for:
• 🏨 Accommodation (hotels, Airbnbs, hostels)
• 🍽️ Dining (restaurants, local food, dietary options)
• 🎭 Activities (tours, nightlife, cultural experiences)
• 📜 History & Culture (landmarks, traditions)

**Where would you like to explore?** Tell me your destination, travel dates, and any preferences (budget, interests), and I'll create recommendations just for you!`,
    timestamp: new Date(),
  };
}

export function useTravelChat({ destination, preferences }: UseTravelChatOptions = {}): UseTravelChatReturn {
  const initialMessage = useMemo(() => getInitialMessage(destination, preferences), [destination, preferences]);
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset messages when destination or preferences change
  useEffect(() => {
    setMessages([getInitialMessage(destination, preferences)]);
  }, [destination, JSON.stringify(preferences)]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    // Build message history for AI context (excluding the initial greeting)
    const historyForAI = [...messages.slice(1), userMessage].map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: historyForAI, 
          destination,
          budget: preferences?.budget,
          interests: preferences?.interests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      // Create initial assistant message
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        },
      ]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (deltaContent) {
              assistantContent += deltaContent;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            }
          } catch {
            // Incomplete JSON, put it back and wait for more data
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Final flush of any remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const deltaContent = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (deltaContent) {
              assistantContent += deltaContent;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: assistantContent }
                    : msg
                )
              );
            }
          } catch {
            // Ignore partial leftovers
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, destination, preferences]);

  const clearError = useCallback(() => setError(null), []);

  return { messages, isLoading, error, sendMessage, clearError };
}
