import { Star, MapPin, Clock, ExternalLink } from 'lucide-react';
import { Place } from '@/types/travel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PlaceCardProps {
  place: Place;
}

const priceLabels = {
  1: '$',
  2: '$$',
  3: '$$$',
  4: '$$$$',
};

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
            {place.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-card/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-semibold text-primary">
            {place.price || priceLabels[place.priceLevel]}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {place.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {place.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-medium text-foreground">{place.rating}</span>
            <span>({place.reviewCount})</span>
          </div>
          {place.distance && typeof place.distance === 'string' && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{place.distance}</span>
            </div>
          )}
        </div>

        {place.openingHours && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{place.openingHours}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {(place.tags || []).slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {(place.tags || []).length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{(place.tags || []).length - 3}
            </Badge>
          )}
        </div>

        {place.link ? (
          <a href={place.link} target="_blank" rel="noopener noreferrer" className="block w-full mt-2">
            <Button variant="soft" size="sm" className="w-full">
              <ExternalLink className="h-4 w-4" />
              View Details
            </Button>
          </a>
        ) : (
          <Button variant="soft" size="sm" className="w-full mt-2" disabled>
            <ExternalLink className="h-4 w-4" />
            View Details
          </Button>
        )}
      </div>
    </div>
  );
}