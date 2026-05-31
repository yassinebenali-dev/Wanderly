import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSaved } from '@/hooks/useSaved';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Card, CardContent } from '@/components/ui/card';
import { Plane, Trash2, MapPin, Calendar, ArrowLeft, Bookmark, Loader2 } from 'lucide-react';
import { Footer } from '@/components/Footer';

const SavedDestinations = () => {
  const { savedList, isLoading, fetchSavedDestinations, deleteFromList } = useSaved();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSavedDestinations();
  }, [user]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
                <Plane className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">Wanderly</span>
            </button>
            <div className="hidden md:block h-6 w-px bg-border" />
            <span className="hidden md:block text-muted-foreground font-medium">Saved Destinations</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle scrolled={true} />
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate('/')}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Search
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {/* Page Title */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="h-6 w-6 text-primary" />
            <h1 className="font-display text-3xl font-bold">Saved Destinations</h1>
          </div>
          <p className="text-muted-foreground">Your saved travel plans, ready to explore anytime.</p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && savedList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Bookmark className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-2">No saved destinations yet</h2>
            <p className="text-muted-foreground mb-6">Search for a destination and save it to see it here.</p>
            <Button onClick={() => navigate('/')} className="rounded-full">
              Start Exploring
            </Button>
          </div>
        )}

        {/* Saved destinations grid */}
        {!isLoading && savedList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedList.map((item) => (
              <Card key={item.id} className="group overflow-hidden border border-border/40 hover:border-primary/20 hover:shadow-hover transition-all duration-300">
                {/* Destination image */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  {item.recommendations?.accommodations?.[0]?.image ? (
                    <img
                      src={item.recommendations.accommodations[0].image}
                      alt={item.destination}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full hero-gradient flex items-center justify-center">
                      <MapPin className="h-10 w-10 text-primary-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <h2 className="font-display text-white text-xl font-bold">{item.destination}</h2>
                  </div>
                  <button
                    onClick={() => deleteFromList(item.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-red-500 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-white" />
                  </button>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Preferences */}
                  <div className="flex flex-wrap gap-2">
                    {item.budget && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        💰 ${item.budget} budget
                      </span>
                    )}
                    {item.interests?.slice(0, 2).map((interest: string) => (
                      <span key={interest} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-sm font-semibold">{item.recommendations?.accommodations?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Stays</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-sm font-semibold">{item.recommendations?.restaurants?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Restaurants</p>
                    </div>
                    <div className="bg-muted rounded-lg p-2">
                      <p className="text-sm font-semibold">{item.recommendations?.activities?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Activities</p>
                    </div>
                  </div>

                  {/* Date + View button */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(item.created_at)}
                    </div>
                    <Button
                      size="sm"
                      className="rounded-full text-xs"
                      onClick={() => navigate('/', { state: { savedItem: item } })}
                    >
                      View Trip
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default SavedDestinations;