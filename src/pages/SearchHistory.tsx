import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { Plane, Search, Trash2, Clock, DollarSign, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { INTEREST_OPTIONS } from '@/types/travel';

const SearchHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { history, loading, fetchHistory, deleteEntry, clearHistory } = useSearchHistory();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchHistory();
  }, [user]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInterestLabels = (interests: string[]) => {
    return interests
      .map(i => INTEREST_OPTIONS.find(opt => opt.value === i)?.label)
      .filter(Boolean)
      .join(', ');
  };

  const handleReSearch = (item: any) => {
    navigate('/', { state: { reSearch: { destination: item.destination, budget: item.budget, interests: item.interests } } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">Wanderly</span>
        </button>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/saved')}>
            Saved Destinations
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Search History</h1>
            <p className="text-muted-foreground">Your recent travel searches</p>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:bg-red-50 hover:border-red-200"
              onClick={() => {
                if (confirm('Are you sure you want to clear all search history?')) {
                  clearHistory();
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No search history yet</h3>
            <p className="text-muted-foreground mb-6">Start exploring destinations to build your history</p>
            <Button variant="hero" onClick={() => navigate('/')}>
              <Search className="h-4 w-4" />
              Start Searching
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-2xl p-5 border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{item.destination}</h3>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      {item.budget && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>Budget: ${item.budget}</span>
                        </div>
                      )}
                      {item.interests && item.interests.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" />
                          <span>{getInterestLabels(item.interests)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDate(item.searched_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => handleReSearch(item)}
                    >
                      <ArrowRight className="h-3.5 w-3.5 mr-1" />
                      Search Again
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-red-500 hover:bg-red-50 hover:border-red-200"
                      onClick={() => deleteEntry(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchHistory;