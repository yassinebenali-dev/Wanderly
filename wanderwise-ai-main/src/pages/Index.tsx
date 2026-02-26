import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeroSection } from '@/components/HeroSection';
import { ChatInterface } from '@/components/ChatInterface';
import { TravelDashboard } from '@/components/TravelDashboard';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Plane, Globe, Users, Star, Compass, ArrowRight, Sparkles, Shield, Zap, LogOut, Bookmark, BookmarkCheck, User, ChevronDown, Loader2 } from 'lucide-react';
import ctaBackground from '@/assets/cta-background.jpg';
import { useRecommendations } from '@/hooks/useRecommendations';
import { UserPreferences, INTEREST_OPTIONS } from '@/types/travel';
import { useAuth } from '@/hooks/useAuth';
import { useSaved } from '@/hooks/useSaved';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [destination, setDestination] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({ interests: [] });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [savedRecommendations, setSavedRecommendations] = useState<any>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { recommendations, isLoading, fetchRecommendations, clearRecommendations } = useRecommendations();
  const { isSaved, savedId, isLoading: saveLoading, checkIfSaved, saveDestination, unsaveDestination } = useSaved();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle loading from saved destination
useEffect(() => {
  if (location.state?.savedItem) {
    const saved = location.state.savedItem;
    setDestination(saved.destination);
    setPreferences({ budget: saved.budget, interests: saved.interests || [] });
    setSavedRecommendations(saved.recommendations);
    setShowDashboard(true);
  }
}, [location.state]);

  // Check if current destination is saved
  useEffect(() => {
    if (destination && user) {
      checkIfSaved(destination);
    }
  }, [destination, user]);

  const handleSearch = async (dest: string, prefs: UserPreferences) => {
    setDestination(dest);
    setPreferences(prefs);
    setShowDashboard(true);
    await fetchRecommendations(dest, prefs);
  };

  const handleBackToSearch = () => {
  setShowDashboard(false);
  setDestination('');
  setPreferences({ interests: [] });
  clearRecommendations();
  setSavedRecommendations(null);
};
  const handleSaveToggle = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (isSaved && savedId) {
      await unsaveDestination(savedId, destination);
    } else if (recommendations) {
      await saveDestination(destination, recommendations, preferences.budget, preferences.interests);
    }
  };

  const getInterestLabels = () => {
    return preferences.interests
      .map(i => INTEREST_OPTIONS.find(opt => opt.value === i)?.label)
      .filter(Boolean)
      .join(', ');
  };

  if (!showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        {/* Scroll-aware Header */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-transparent backdrop-blur-sm'
        }`}>
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
                <Plane className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className={`font-display font-bold text-lg transition-colors duration-500 ${
                scrolled ? 'text-foreground' : 'text-primary-foreground'
              }`}>Wanderly</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: 'Destinations', href: '#' },
                { label: 'Experiences', href: '/experiences' },
                { label: 'About', href: '/about' },
              ].map((item) => (
                <a key={item.label} href={item.href} className={`text-sm font-medium transition-colors duration-500 ${
                  scrolled
                    ? 'text-muted-foreground hover:text-foreground'
                    : 'text-primary-foreground/70 hover:text-primary-foreground'
                }`}>{item.label}</a>
              ))}
            </nav>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 text-sm transition-colors duration-500 ${
                    scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-primary-foreground/70 hover:text-primary-foreground'
                  }`}>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden md:block">{user.display_name || user.email}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/saved')}>
                    <Bookmark className="h-4 w-4 mr-2" />
                    Saved Destinations
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-500">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className={`rounded-full text-xs transition-all duration-500 ${
                  !scrolled && 'border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10'
                }`}
                onClick={() => navigate('/auth')}
              >
                Sign In
              </Button>
            )}
          </div>
        </header>

        <main>
          <HeroSection onSearch={handleSearch} />

          {/* How It Works */}
          <section className="py-28">
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <span className="text-xs font-semibold text-primary uppercase tracking-[0.2em]">How it works</span>
                <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mt-4 leading-[1.1]">
                  Travel planning,<br />
                  <span className="text-gradient">reimagined.</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: Sparkles, title: 'Tell Us Your Vibe', desc: 'Share your interests, budget, and travel dates — our AI listens.', num: '01' },
                  { icon: Zap, title: 'Instant Curation', desc: 'Get curated stays, restaurants, and hidden gems in seconds.', num: '02' },
                  { icon: Shield, title: 'Verified Quality', desc: 'Every recommendation is vetted by real travelers and AI.', num: '03' },
                  { icon: Compass, title: 'Live Guidance', desc: 'Chat with your AI companion anytime during your trip.', num: '04' },
                ].map((feature) => (
                  <div
                    key={feature.num}
                    className="group relative rounded-2xl p-6 bg-card border border-border/40 hover:border-primary/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-hover"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground/50">{feature.num}</span>
                    </div>
                    <h3 className="font-display font-semibold text-foreground text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24">
            <div className="container mx-auto px-4">
              <div className="relative overflow-hidden rounded-3xl p-12 md:p-20 min-h-[400px] flex items-center">
                <img src={ctaBackground} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-foreground/60" />
                <div className="relative z-10 max-w-2xl">
                  <h2 className="font-display text-3xl md:text-5xl font-bold leading-[1.1] mb-5 text-white">
                    Ready for your next chapter?
                  </h2>
                  <p className="text-white/70 text-lg mb-8 leading-relaxed">
                    Let our AI craft a trip that's uniquely yours — from the first morning coffee to the last sunset.
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full border-white/30 text-white hover:bg-white hover:text-foreground group"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    Start Planning
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />

        {/* Chat FAB */}
        <div className="fixed bottom-6 right-6 z-50">
          {isChatOpen ? (
            <div className="w-[380px] h-[550px] animate-slide-up">
              <div className="absolute -top-2 -right-2 z-10">
                <Button variant="icon" size="icon" onClick={() => setIsChatOpen(false)} className="shadow-card">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ChatInterface destination={destination} preferences={preferences} />
            </div>
          ) : (
            <Button variant="hero" size="lg" onClick={() => setIsChatOpen(true)} className="rounded-full shadow-glow">
              <MessageCircle className="h-5 w-5" />
              Chat with AI
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBackToSearch} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
                <Plane className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">Wanderly</span>
            </button>
            <div className="hidden md:block h-6 w-px bg-border" />
            <div className="hidden md:block">
              <span className="text-muted-foreground">
                Exploring <span className="text-foreground font-medium">{destination}</span>
              </span>
              {(preferences.budget || preferences.interests.length > 0) && (
                <div className="text-xs text-muted-foreground">
                  {preferences.budget && <span>Budget: ${preferences.budget}</span>}
                  {preferences.budget && preferences.interests.length > 0 && <span> • </span>}
                  {preferences.interests.length > 0 && <span>Interests: {getInterestLabels()}</span>}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save button in header */}
            {recommendations && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleSaveToggle}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isSaved ? (
                  <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <Bookmark className="h-3.5 w-3.5" />
                )}
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-full" onClick={handleBackToSearch}>
              New Search
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          <div className="lg:col-span-1 h-full">
            <ChatInterface destination={destination} preferences={preferences} />
          </div>
          <div className="lg:col-span-2 h-full overflow-auto relative">
            {/* Floating save button */}
            {recommendations && (
              <div className="absolute top-4 right-4 z-10">
                <Button
                  size="sm"
                  className="rounded-full shadow-lg"
                  onClick={handleSaveToggle}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isSaved ? (
                    <BookmarkCheck className="h-3.5 w-3.5" />
                  ) : (
                    <Bookmark className="h-3.5 w-3.5" />
                  )}
                  {isSaved ? 'Saved!' : 'Save Trip'}
                </Button>
              </div>
            )}
            <TravelDashboard
              accommodations={(savedRecommendations || recommendations)?.accommodations}
              restaurants={(savedRecommendations || recommendations)?.restaurants}
              activities={(savedRecommendations || recommendations)?.activities}
              landmarks={(savedRecommendations || recommendations)?.landmarks}
              history={(savedRecommendations || recommendations)?.history}
              isLoading={isLoading}
              destination={destination}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;