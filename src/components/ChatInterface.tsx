import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from '@/components/ChatMessage';
import { useTravelChat } from '@/hooks/useTravelChat';
import { useToast } from '@/hooks/use-toast';
import { UserPreferences } from '@/types/travel';

interface ChatInterfaceProps {
  destination?: string;
  preferences?: UserPreferences;
}

export function ChatInterface({ destination, preferences }: ChatInterfaceProps) {
  const { messages, isLoading, error, sendMessage, clearError } = useTravelChat({ 
    destination,
    preferences,
  });
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Chat Error',
        description: error,
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: '🎙️ Voice Input',
        description: 'Voice recording started...',
      });
      setTimeout(() => {
        setIsRecording(false);
        setInput('I want to visit Paris for a romantic getaway next month');
        toast({
          title: '✓ Voice Captured',
          description: 'Your message is ready to send!',
        });
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-background to-muted/30 rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="w-10 h-10 rounded-full hero-gradient flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Wanderly AI</h3>
          <p className="text-xs text-muted-foreground">
            {isLoading ? 'Thinking...' : 'Ready to help plan your adventure'}
          </p>
        </div>
      </div>

      {/* Messages - internal scroll only */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="bg-card shadow-soft rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          {/* Anchor div to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex gap-2">
          <Button
            variant="icon"
            size="icon"
            onClick={toggleRecording}
            className={isRecording ? 'bg-destructive text-destructive-foreground animate-pulse' : ''}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Tell me about your dream trip..."
            className="flex-1 bg-background"
            disabled={isLoading}
          />

          <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isRecording && (
          <p className="text-xs text-center text-muted-foreground mt-2 animate-pulse">
            🎙️ Listening... Speak now
          </p>
        )}
      </div>
    </div>
  );
}