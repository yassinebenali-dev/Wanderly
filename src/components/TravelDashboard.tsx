import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceCard } from '@/components/PlaceCard';
import { Hotel, Utensils, PartyPopper, BookOpen, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Place, CityHistory } from '@/types/travel';
import { Skeleton } from '@/components/ui/skeleton';

interface TravelDashboardProps {
  accommodations?: Place[];
  restaurants?: Place[];
  activities?: Place[];
  landmarks?: Place[];
  history?: CityHistory;
  isLoading?: boolean;
  destination?: string;
}

export function TravelDashboard({
  accommodations = [],
  restaurants = [],
  activities = [],
  landmarks = [],
  history,
  isLoading = false,
  destination,
}: TravelDashboardProps) {
  const [activeTab, setActiveTab] = useState('stay');

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
        <TabsList className="w-full justify-start gap-2 bg-transparent p-0 mb-6">
          <TabsTrigger
            value="stay"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2.5 gap-2"
          >
            <Hotel className="h-4 w-4" />
            Stay
          </TabsTrigger>
          <TabsTrigger
            value="food"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2.5 gap-2"
          >
            <Utensils className="h-4 w-4" />
            Food
          </TabsTrigger>
          <TabsTrigger
            value="hangout"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2.5 gap-2"
          >
            <PartyPopper className="h-4 w-4" />
            Hangout
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-5 py-2.5 gap-2"
          >
            <BookOpen className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto pr-2 relative">
          <TabsContent value="stay" className="mt-0 animate-fade-in">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">Where to Stay</h2>
              <p className="text-muted-foreground">
                {destination ? `Handpicked accommodations in ${destination}` : 'Handpicked accommodations for every budget'}
              </p>
            </div>
            {isLoading ? renderSkeleton() : accommodations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accommodations.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            ) : renderEmptyState('stay')}
          </TabsContent>

          <TabsContent value="food" className="mt-0 animate-fade-in">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">Where to Eat</h2>
              <p className="text-muted-foreground">
                {destination ? `Local gems and dining in ${destination}` : 'From local gems to fine dining experiences'}
              </p>
            </div>
            {isLoading ? renderSkeleton() : restaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {restaurants.map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
              </div>
            ) : renderEmptyState('food')}
          </TabsContent>

          <TabsContent value="hangout" className="mt-0 animate-fade-in">
            <div className="mb-4">
              <h2 className="font-display text-2xl font-semibold text-foreground">Things to Do</h2>
              <p className="text-muted-foreground">
                {destination ? `Activities and attractions in ${destination}` : 'Activities, nightlife, and must-see attractions'}
              </p>
            </div>
            {isLoading ? renderSkeleton() : (activities.length > 0 || landmarks.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...activities, ...landmarks].map((place) => (
                  <PlaceCard key={place.id} place={place} />
                ))}
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
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                  ))}
                </div>
              </div>
            ) : history ? (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">{history.title}</h2>
                  <p className="text-muted-foreground">Discover the story of this remarkable destination</p>
                </div>

                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {history.content}
                  </p>
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
        </div>
      </Tabs>
    </div>
  );
}
