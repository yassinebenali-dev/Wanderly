import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Itinerary } from '@/hooks/useItinerary';
import { Calendar, Clock, MapPin, DollarSign, Lightbulb, Bus, Loader2, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface ItineraryViewProps {
  destination: string;
  budget?: number;
  interests?: string[];
  arrivalDate?: string;
  departureDate?: string;
  savedDestinationId?: number;
  itinerary: Itinerary | null;
  loading: boolean;
  onGenerate: (nbDays?: number) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  showSaveButton?: boolean;
}

export function ItineraryView({
  destination,
  arrivalDate,
  departureDate,
  savedDestinationId,
  itinerary,
  loading,
  onGenerate,
  onSave,
  saving,
  saved,
  showSaveButton = false,
}: ItineraryViewProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [manualDays, setManualDays] = useState<number>(3);

  const hasDates = arrivalDate && departureDate;

  const calculateDays = () => {
    if (hasDates) {
      const arrival = new Date(arrivalDate);
      const departure = new Date(departureDate);
      const diff = Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    }
    return manualDays;
  };

  if (!itinerary && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Itinerary Yet</h3>

        {hasDates ? (
          <>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              Generate a {calculateDays()}-day personalized itinerary for {destination}
            </p>
            <Button variant="hero" onClick={() => onGenerate()} className="rounded-full">
              <Sparkles className="h-4 w-4" />
              Generate Itinerary
            </Button>
          </>
        ) : (
          <>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm">
              You didn't set travel dates. How many days are you planning to stay in {destination}?
            </p>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setManualDays(prev => Math.max(1, prev - 1))}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg font-semibold hover:bg-muted transition-colors"
              >
                −
              </button>
              <div className="text-center">
                <span className="text-4xl font-bold text-primary">{manualDays}</span>
                <p className="text-xs text-muted-foreground mt-1">{manualDays === 1 ? 'day' : 'days'}</p>
              </div>
              <button
                onClick={() => setManualDays(prev => Math.min(14, prev + 1))}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-lg font-semibold hover:bg-muted transition-colors"
              >
                +
              </button>
            </div>
            <Button variant="hero" onClick={() => onGenerate(manualDays)} className="rounded-full">
              <Sparkles className="h-4 w-4" />
              Generate {manualDays}-Day Itinerary
            </Button>
          </>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Generating your personalized itinerary...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {itinerary!.nb_days}-Day Itinerary for {itinerary!.destination}
          </h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            {itinerary!.total_estimated_cost && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Est. {itinerary!.total_estimated_cost}</span>
              </div>
            )}
            {itinerary!.best_transport && (
              <div className="flex items-center gap-1">
                <Bus className="h-3.5 w-3.5" />
                <span>{itinerary!.best_transport}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {savedDestinationId && showSaveButton && itinerary && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Save Itinerary
            </Button>
          )}
          {saved && (
            <span className="text-sm text-primary font-medium">✓ Saved!</span>
          )}
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => onGenerate(hasDates ? undefined : manualDays)}
            disabled={loading}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Regenerate
          </Button>
        </div>
      </div>

      {itinerary!.general_tips && (
        <div className="bg-primary/5 rounded-xl p-4 flex gap-3">
          <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">{itinerary!.general_tips}</p>
        </div>
      )}

      <div className="space-y-3">
        {itinerary!.days.map((day) => (
          <div key={day.day} className="bg-card rounded-2xl border border-border overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
              onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full hero-gradient flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-foreground">{day.day}</span>
                </div>
                <div className="text-left">
                  <span className="font-semibold text-foreground text-sm">Day {day.day}</span>
                  <p className="text-xs text-muted-foreground">{day.title}</p>
                </div>
              </div>
              {expandedDay === day.day
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />
              }
            </button>

            {expandedDay === day.day && (
              <div className="px-4 pb-4 space-y-3">
                {[
                  { label: 'Morning', data: day.morning, color: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50' },
                  { label: 'Afternoon', data: day.afternoon, color: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50' },
                  { label: 'Evening', data: day.evening, color: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800/50' },
                ].map((slot) => (
                  <div key={slot.label} className={`rounded-xl p-4 border ${slot.color}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{slot.label}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {slot.data?.time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{slot.data.time}</span>
                          </div>
                        )}
                        {slot.data?.duration && <span>{slot.data.duration}</span>}
                        {slot.data?.cost && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{slot.data.cost}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground text-sm mb-1">{slot.data?.activity}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{slot.data?.description}</p>
                    {slot.data?.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{slot.data.location}</span>
                      </div>
                    )}
                  </div>
                ))}
                {day.tip && (
                  <div className="flex gap-2 bg-muted/30 rounded-xl p-3">
                    <Lightbulb className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">{day.tip}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}