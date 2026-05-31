import { useState } from 'react';
import { Search, MapPin, Calendar, Sparkles, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { INTEREST_OPTIONS, UserPreferences } from '@/types/travel';
import heroVideo from '@/assets/hero-background.mp4';

interface HeroSectionProps {
  onSearch: (destination: string, preferences: UserPreferences) => void;
}

export function HeroSection({ onSearch }: HeroSectionProps) {
  const [destination, setDestination] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const today = new Date().toISOString().split('T')[0];

 const handleSearch = () => {
    if (destination.trim()) {
      onSearch(destination, {
        budget: budget ? parseInt(budget) : undefined,
        interests: selectedInterests,
        arrivalDate: arrivalDate || undefined,
        departureDate: departureDate || undefined,
      });
    }
  };

  const handleArrivalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newArrival = e.target.value;
    setArrivalDate(newArrival);
    // Reset departure if it's before the new arrival date
    if (departureDate && departureDate <= newArrival) {
      setDepartureDate('');
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src={heroVideo}
      />
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />

      <div className="relative z-10 container mx-auto px-4 text-center pt-24 pb-12">
        <div className="mb-5 inline-flex items-center gap-2 bg-primary-foreground/8 text-primary-foreground border border-primary-foreground/15 rounded-full px-4 py-2 text-xs font-medium backdrop-blur-md tracking-wide">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Travel Planning
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-primary-foreground mb-5 leading-[1.05] tracking-tight">
          Discover Your
          <span className="block text-gradient mt-1">Next Adventure</span>
        </h1>

        <p className="text-base md:text-lg text-primary-foreground/60 max-w-xl mx-auto mb-10 leading-relaxed font-light">
          Personalized recommendations for stays, dining, and experiences — all powered by intelligent AI.
        </p>

        {/* Modern Search Card */}
        <div className="max-w-3xl mx-auto bg-card/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-6 md:p-8 border border-border/30">
          {/* Destination + Dates row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="md:col-span-1">
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Where to?"
                  className="pl-10 h-12 rounded-2xl bg-muted/40 border-0 focus:bg-card focus:ring-1 focus:ring-primary/30 text-sm"
                />
              </div>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 z-10" />
              <Input
                type="date"
                value={arrivalDate}
                min={today}
                onChange={handleArrivalChange}
                className="pl-10 h-12 rounded-2xl bg-muted/40 border-0 focus:bg-card focus:ring-1 focus:ring-primary/30 text-sm"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 z-10" />
              <Input
                type="date"
                value={departureDate}
                min={arrivalDate || today}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="pl-10 h-12 rounded-2xl bg-muted/40 border-0 focus:bg-card focus:ring-1 focus:ring-primary/30 text-sm"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0 w-40">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Budget"
                className="pl-10 h-10 rounded-xl bg-muted/40 border-0 focus:bg-card focus:ring-1 focus:ring-primary/30 text-sm"
                min="0"
              />
            </div>
            <span className="text-xs text-muted-foreground hidden md:inline">Max trip budget (USD)</span>
          </div>

          {/* Interests */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest.value}
                onClick={() => toggleInterest(interest.value)}
                className={`text-xs font-medium py-1.5 px-3.5 rounded-full transition-all duration-200 ${
                  selectedInterests.includes(interest.value)
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                <span className="mr-1">{interest.emoji}</span>
                {interest.label}
              </button>
            ))}
          </div>

          <Button
            variant="hero"
            size="lg"
            className="w-full rounded-2xl h-12"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
            Explore Destination
          </Button>
        </div>

        {/* Trending */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 items-center">
          <span className="text-xs text-primary-foreground/40 uppercase tracking-wider mr-1">Trending</span>
          {['Paris', 'Tokyo', 'New York', 'Barcelona', 'Bali'].map((city) => (
            <button
              key={city}
              onClick={() => setDestination(city)}
              className="text-xs text-primary-foreground/70 hover:text-primary-foreground rounded-full px-3 py-1 backdrop-blur-sm hover:bg-primary-foreground/10 transition-all border border-primary-foreground/15"
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}