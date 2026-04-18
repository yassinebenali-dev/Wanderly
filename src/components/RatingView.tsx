import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRatings } from '@/hooks/useRatings';
import { useAuth } from '@/hooks/useAuth';
import { Star, Loader2, Trash2, MessageCircle } from 'lucide-react';

interface RatingViewProps {
  destination: string;
}

export function RatingView({ destination }: RatingViewProps) {
  const { user } = useAuth();
  const { ratingsData, userRating, loading, fetchRatings, fetchUserRating, submitRating, deleteRating } = useRatings();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (destination) {
      fetchRatings(destination);
      if (user) fetchUserRating(destination);
    }
  }, [destination, user]);

  useEffect(() => {
    if (userRating) {
      setSelectedRating(userRating.rating);
      setComment(userRating.comment || '');
    }
  }, [userRating]);

  const handleSubmit = async () => {
    if (!selectedRating) return;
    setSubmitting(true);
    const success = await submitRating(destination, selectedRating, comment);
    if (success) setShowForm(false);
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete your rating?')) return;
    await deleteRating(destination);
    setSelectedRating(0);
    setComment('');
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const StarDisplay = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Ratings & Reviews for {destination}
            </h3>
            {ratingsData?.avg_rating ? (
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-foreground">{ratingsData.avg_rating}</span>
                <div>
                  <StarDisplay rating={Math.round(parseFloat(ratingsData.avg_rating))} size="lg" />
                  <p className="text-sm text-muted-foreground mt-1">{ratingsData.total} review{ratingsData.total !== 1 ? 's' : ''}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No reviews yet — be the first!</p>
            )}
          </div>

          {user && (
            <div className="flex gap-2">
              {userRating && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-red-500 hover:bg-red-50"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete Review
                </Button>
              )}
              <Button
                size="sm"
                variant={userRating ? 'outline' : 'hero'}
                className="rounded-full"
                onClick={() => setShowForm(!showForm)}
              >
                <Star className="h-3.5 w-3.5 mr-1" />
                {userRating ? 'Edit Review' : 'Write Review'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showForm && user && (
        <div className="bg-card rounded-2xl border border-primary/20 p-6">
          <h4 className="font-semibold text-foreground mb-4">
            {userRating ? 'Edit your review' : 'Write a review'}
          </h4>

          {/* Star Selector */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Your rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || selectedRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
              {selectedRating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground self-center">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][selectedRating]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Your comment (optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience in ${destination}...`}
              rows={3}
              className="w-full px-4 py-3 bg-muted/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="hero"
              className="rounded-full"
              onClick={handleSubmit}
              disabled={!selectedRating || submitting}
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              {userRating ? 'Update Review' : 'Submit Review'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {!user && (
        <div className="bg-muted/30 rounded-xl p-4 text-center text-sm text-muted-foreground">
          Sign in to leave a review for {destination}
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : ratingsData?.ratings && ratingsData.ratings.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            All Reviews
          </h4>
          {ratingsData.ratings.map((r) => (
            <div key={r.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {(r.display_name || r.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.display_name || r.email}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                  </div>
                </div>
                <StarDisplay rating={r.rating} />
              </div>
              {r.comment && (
                <p className="text-sm text-muted-foreground pl-10">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No reviews yet for {destination}
        </div>
      )}
    </div>
  );
}