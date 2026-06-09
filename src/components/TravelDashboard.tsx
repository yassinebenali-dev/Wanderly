import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceCard } from '@/components/PlaceCard';
import { Hotel, Utensils, PartyPopper, BookOpen, Loader2, Calendar, CheckSquare, PiggyBank, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Place, CityHistory, UserPreferences } from '@/types/travel';
import { Skeleton } from '@/components/ui/skeleton';
import { ItineraryView } from '@/components/ItineraryView';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChecklistView } from '@/components/ChecklistView';
import { BudgetView } from '@/components/BudgetView';
import { RatingView } from '@/components/RatingView';
import { useAuth } from '@/hooks/useAuth';
import { useItinerary, Itinerary } from '@/hooks/useItinerary';
import { useChecklist, Checklist } from '@/hooks/useChecklist';
import { useBudget, Budget } from '@/hooks/useBudget';

interface TravelDashboardProps {
  accommodations?: Place[];
  restaurants?: Place[];
  activities?: Place[];
  landmarks?: Place[];
  history?: CityHistory;
  isLoading?: boolean;
  destination?: string;
  preferences?: UserPreferences;
  savedDestinationId?: number;
  existingItinerary?: Itinerary | null;
  existingChecklist?: Checklist | null;
  existingBudget?: Budget | null;
  onItineraryChange?: (itinerary: Itinerary | null) => void;
  onChecklistChange?: (checklist: Checklist | null) => void;
  onBudgetChange?: (budget: Budget | null) => void;
}

export function TravelDashboard({
  accommodations = [],
  restaurants = [],
  activities = [],
  landmarks = [],
  history,
  isLoading = false,
  destination,
  preferences,
  savedDestinationId,
  existingItinerary,
  existingChecklist,
  existingBudget,
  onItineraryChange,
  onChecklistChange,
  onBudgetChange,
}: TravelDashboardProps) {
  const [activeTab, setActiveTab] = useState('stay');
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();

  const [itinerarySaving, setItinerarySaving] = useState(false);
  const [itinerarySaved, setItinerarySaved] = useState(false);
  const [itineraryChanged, setItineraryChanged] = useState(false);
  const { itinerary, loading: itineraryLoading, generateItinerary, saveItinerary, setItinerary } = useItinerary();

  const [checklistSaving, setChecklistSaving] = useState(false);
  const [checklistSaved, setChecklistSaved] = useState(false);
  const [checklistChanged, setChecklistChanged] = useState(false);
  const { checklist, loading: checklistLoading, generateChecklist, saveChecklist, toggleItem, setChecklistData } = useChecklist();

  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetSaved, setBudgetSaved] = useState(false);
  const [budgetChanged, setBudgetChanged] = useState(false);
  const { budget, loading: budgetLoading, initBudget, saveBudget, updateCategory, getTotalAllocated, getRemaining, setBudgetData } = useBudget();

  useEffect(() => {
    if (existingItinerary) {
      setItinerary(existingItinerary);
      setItineraryChanged(false);
      setItinerarySaved(false);
    }
  }, [existingItinerary]);

  useEffect(() => {
    if (existingChecklist) {
      setChecklistData(existingChecklist);
      setChecklistChanged(false);
      setChecklistSaved(false);
    }
  }, [existingChecklist]);

  useEffect(() => {
    if (existingBudget) {
      setBudgetData(existingBudget);
      setBudgetChanged(false);
      setBudgetSaved(false);
    }
  }, [existingBudget]);

  const calculateDays = () => {
    if (preferences?.arrivalDate && preferences?.departureDate) {
      const arrival = new Date(preferences.arrivalDate);
      const departure = new Date(preferences.departureDate);
      const diff = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    }
    return 3;
  };

  const handleGenerateItinerary = async (nbDays?: number) => {
  if (!destination) return;
  const days = nbDays || calculateDays();
  const result = await generateItinerary(destination, days, preferences?.budget, preferences?.interests);
  if (result) {
    onItineraryChange?.(result);
    // Auto-save if destination is already saved
    if (savedDestinationId) {
      const success = await saveItinerary(savedDestinationId, result, days);
      if (success) {
        setItineraryChanged(false);
        setItinerarySaved(true);
      } else {
        setItineraryChanged(true);
        setItinerarySaved(false);
      }
    } else {
      setItineraryChanged(true);
      setItinerarySaved(false);
    }
  }
};

  const handleSaveItinerary = async () => {
    if (!savedDestinationId || !itinerary) return;
    setItinerarySaving(true);
    const nbDays = calculateDays();
    const success = await saveItinerary(savedDestinationId, itinerary, nbDays);
    if (success) {
      setItinerarySaved(true);
      setItineraryChanged(false);
    }
    setItinerarySaving(false);
  };

  const handleGenerateChecklist = async () => {
  if (!destination) return;
  const result = await generateChecklist(destination, preferences?.interests, preferences?.budget, preferences?.arrivalDate, preferences?.departureDate);
  if (result) {
    onChecklistChange?.(result);
    // Auto-save if destination is already saved
    if (savedDestinationId) {
      const success = await saveChecklist(savedDestinationId, result);
      if (success) {
        setChecklistChanged(false);
        setChecklistSaved(true);
      } else {
        setChecklistChanged(false);
        setChecklistSaved(false);
      }
    } else {
      setChecklistChanged(false);
      setChecklistSaved(false);
    }
  }
};

  const handleSaveChecklist = async () => {
    if (!savedDestinationId || !checklist) return;
    setChecklistSaving(true);
    const success = await saveChecklist(savedDestinationId, checklist);
    if (success) {
      setChecklistSaved(true);
      setChecklistChanged(false);
    }
    setChecklistSaving(false);
  };

  const handleToggleItem = (categoryName: string, itemId: string) => {
    toggleItem(categoryName, itemId);
    setChecklistChanged(true);
    setChecklistSaved(false);
  };

  const handleInitBudget = (total: number) => {
    initBudget(total);
    setBudgetChanged(true);
    setBudgetSaved(false);
  };

  const handleUpdateCategory = (name: string, amount: number) => {
    updateCategory(name, amount);
    onBudgetChange?.(budget);
    setBudgetChanged(true);
    setBudgetSaved(false);
  };

  const handleSaveBudget = async () => {
    if (!savedDestinationId || !budget) return;
    setBudgetSaving(true);
    const success = await saveBudget(savedDestinationId, budget);
    if (success) {
      setBudgetSaved(true);
      setBudgetChanged(false);
    }
    setBudgetSaving(false);
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card rounded-xl p-4 shadow-soft">
          <Skeleton className="h-40 w-full rounded-lg mb-4" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = (type: string) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {type === 'stay' && <Hotel className="h-8 w-8 text-muted-foreground" />}
        {type === 'food' && <Utensils className="h-8 w-8 text-muted-foreground" />}
        {type === 'hangout' && <PartyPopper className="h-8 w-8 text-muted-foreground" />}
        {type === 'history' && <BookOpen className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="font-semibold text-foreground mb-2">No recommendations yet</h3>
      <p className="text-muted-foreground text-sm max-w-xs">
        Search for a destination to get personalized {type === 'stay' ? 'accommodation' : type} recommendations.
      </p>
    </div>
  );
  const renderAuthMessage = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <h3 className="text-xl font-semibold mb-2">
      Sign in to unlock this feature
    </h3>

    <p className="text-muted-foreground max-w-md">
      Create an account or sign in to generate personalized itineraries,
      travel checklists, and budget plans tailored to your trip.
    </p>

    
    <Button onClick={() => navigate('/auth')}>
      Sign In
    </Button>
  </div>
);

  return (
    <div className="h-full flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Finding the best spots in {destination}...</p>
          </div>
        </div>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start gap-1 bg-transparent p-0 mb-6 flex-wrap">
          <TabsTrigger value="stay" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 gap-1.5 text-sm">
  <Hotel className="h-4 w-4" />Stay
</TabsTrigger>
<TabsTrigger value="food" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 gap-1.5 text-sm">
  <Utensils className="h-4 w-4" />Food
</TabsTrigger>
<TabsTrigger value="hangout" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 gap-1.5 text-sm">
  <PartyPopper className="h-4 w-4" />Hangout
</TabsTrigger>
<TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 gap-1.5 text-sm">
  <BookOpen className="h-4 w-4" />History
</TabsTrigger>
<TabsTrigger value="itinerary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 gap-1.5 text-sm">
  <Calendar className="h-4 w-4" />Itinerary
</TabsTrigger>
<TabsTrigger value="checklist" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 gap-1.5 text-sm">
  <CheckSquare className="h-4 w-4" />Checklist
</TabsTrigger>
<TabsTrigger value="budget" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 gap-1.5 text-sm">
  <PiggyBank className="h-4 w-4" />Budget
</TabsTrigger>
<TabsTrigger value="ratings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 gap-1.5 text-sm">
  <Star className="h-4 w-4" />Ratings
</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto pr-2 relative">
          <TabsContent value="stay" className="mt-0 animate-fade-in">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">Where to Stay</h2>
              <p className="text-muted-foreground">{destination ? `Handpicked accommodations in ${destination}` : 'Handpicked accommodations for every budget'}</p>
            </div>
            {isLoading ? renderSkeleton() : accommodations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accommodations.map((place) => <PlaceCard key={place.id} place={place} />)}
              </div>
            ) : renderEmptyState('stay')}
          </TabsContent>

          <TabsContent value="food" className="mt-0 animate-fade-in">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">Where to Eat</h2>
              <p className="text-muted-foreground">{destination ? `Local gems and dining in ${destination}` : 'From local gems to fine dining experiences'}</p>
            </div>
            {isLoading ? renderSkeleton() : restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restaurants.map((place) => <PlaceCard key={place.id} place={place} />)}
              </div>
            ) : renderEmptyState('food')}
          </TabsContent>

          <TabsContent value="hangout" className="mt-0 animate-fade-in">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">Things to Do</h2>
              <p className="text-muted-foreground">{destination ? `Activities and attractions in ${destination}` : 'Activities, nightlife, and must-see attractions'}</p>
            </div>
            {isLoading ? renderSkeleton() : (activities.length > 0 || landmarks.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...activities, ...landmarks].map((place) => <PlaceCard key={place.id} place={place} />)}
              </div>
            ) : renderEmptyState('hangout')}
          </TabsContent>

          <TabsContent value="history" className="mt-0 animate-fade-in">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-40 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
              </div>
            ) : history ? (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">{history.title}</h2>
                  <p className="text-muted-foreground">Discover the story of this remarkable destination</p>
                </div>
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">{history.content}</p>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-4">Local Traditions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {history.traditions.map((tradition, index) => (
                      <div key={index} className="bg-card rounded-xl p-5 shadow-soft">
                        <Badge className="mb-3 hero-gradient">Tradition</Badge>
                        <h4 className="font-semibold text-foreground mb-2">{tradition.name}</h4>
                        <p className="text-sm text-muted-foreground">{tradition.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : renderEmptyState('history')}
          </TabsContent>

          <TabsContent value="itinerary" className="mt-0 animate-fade-in">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">Your Itinerary</h2>
              <p className="text-muted-foreground">
                {destination ? `Personalized day-by-day plan for ${destination}` : 'Generate a personalized travel plan'}
              </p>
            </div>
            {!isAuthenticated
              ? renderAuthMessage()
              : destination && (
                  <ItineraryView
                    destination={destination}
                    budget={preferences?.budget}
                    interests={preferences?.interests}
                    arrivalDate={preferences?.arrivalDate}
                    departureDate={preferences?.departureDate}
                    savedDestinationId={savedDestinationId}
                    itinerary={itinerary}
                    loading={itineraryLoading}
                    onGenerate={handleGenerateItinerary}
                    onSave={handleSaveItinerary}
                    saving={itinerarySaving}
                    saved={itinerarySaved}
                    showSaveButton={itineraryChanged && !itinerarySaved}
                  />
                )}
          </TabsContent>

          <TabsContent value="checklist" className="mt-0 animate-fade-in">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">Preparation Checklist</h2>
              <p className="text-muted-foreground">
                {destination ? `Everything you need for your trip to ${destination}` : 'Generate a preparation checklist'}
              </p>
            </div>
            {!isAuthenticated
              ? renderAuthMessage()
              : destination && (
              <ChecklistView
                destination={destination}
                interests={preferences?.interests}
                budget={preferences?.budget}
                savedDestinationId={savedDestinationId}
                checklist={checklist}
                loading={checklistLoading}
                onGenerate={handleGenerateChecklist}
                onSave={handleSaveChecklist}
                onToggle={handleToggleItem}
                saving={checklistSaving}
                saved={checklistSaved}
                showSaveButton={checklistChanged && !checklistSaved}
              />
            )}
          </TabsContent>

          <TabsContent value="budget" className="mt-0 animate-fade-in">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">Budget Planner</h2>
              <p className="text-muted-foreground">
                {destination ? `Plan your spending for ${destination}` : 'Allocate your budget across categories'}
              </p>
            </div>
            {!isAuthenticated
              ? renderAuthMessage()
              : destination && (
              <BudgetView
                destination={destination}
                totalBudget={preferences?.budget}
                savedDestinationId={savedDestinationId}
                budget={budget}
                loading={budgetLoading}
                onSave={handleSaveBudget}
                onUpdate={handleUpdateCategory}
                onInit={handleInitBudget}
                saving={budgetSaving}
                saved={budgetSaved}
                showSaveButton={budgetChanged && !budgetSaved}
                getTotalAllocated={getTotalAllocated}
                getRemaining={getRemaining}
              />
            )}
          </TabsContent>

          <TabsContent value="ratings" className="mt-0 animate-fade-in">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">Ratings & Reviews</h2>
              <p className="text-muted-foreground">
                {destination ? `Community reviews for ${destination}` : 'See what travelers think'}
              </p>
            </div>
            {destination && <RatingView destination={destination} />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

