import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';
import { Plane, Compass, Star, MapPin, ArrowRight, Mountain, UtensilsCrossed, Landmark, Sparkles, Moon, Camera } from 'lucide-react';

import experiencesHero from '@/assets/experiences-hero.jpg';
import expAdventure from '@/assets/exp-adventure.jpg';
import expCulinary from '@/assets/exp-culinary.jpg';
import expCulture from '@/assets/exp-culture.jpg';
import expWellness from '@/assets/exp-wellness.jpg';
import expNightlife from '@/assets/exp-nightlife.jpg';
import expNature from '@/assets/exp-nature.jpg';

const experiences = [
  {
    title: 'Adventure & Thrills',
    desc: 'Kayaking, hiking, skydiving, and adrenaline-packed journeys through breathtaking landscapes.',
    image: expAdventure,
    icon: Mountain,
    tags: ['Hiking', 'Water Sports', 'Climbing'],
  },
  {
    title: 'Culinary Journeys',
    desc: 'From Michelin-star dining to hidden street food stalls — taste the soul of every destination.',
    image: expCulinary,
    icon: UtensilsCrossed,
    tags: ['Fine Dining', 'Street Food', 'Wine Tours'],
  },
  {
    title: 'Culture & Heritage',
    desc: 'Walk through ancient ruins, visit world-class museums, and connect with living traditions.',
    image: expCulture,
    icon: Landmark,
    tags: ['Museums', 'Historic Sites', 'Local Festivals'],
  },
  {
    title: 'Wellness & Relaxation',
    desc: 'Overwater bungalows, spa retreats, and serene escapes designed to restore your energy.',
    image: expWellness,
    icon: Sparkles,
    tags: ['Spa', 'Yoga Retreats', 'Beach Resorts'],
  },
  {
    title: 'Nightlife & Entertainment',
    desc: 'Vibrant night markets, rooftop bars, live music, and the electric energy of cities after dark.',
    image: expNightlife,
    icon: Moon,
    tags: ['Night Markets', 'Rooftop Bars', 'Live Music'],
  },
  {
    title: 'Nature & Photography',
    desc: 'Sunrise summits, wildlife safaris, and panoramic vistas that demand to be captured.',
    image: expNature,
    icon: Camera,
    tags: ['Wildlife', 'Scenic Trails', 'Sunrise Tours'],
  },
];

const featuredTestimonials = [
  { quote: 'The AI recommended a hidden cooking class in Oaxaca that became the highlight of our trip.', author: 'Maria S.', location: 'Mexico' },
  { quote: 'I never would have found that sunrise hike in Bali without Wanderly. Absolutely magical.', author: 'James L.', location: 'Indonesia' },
  { quote: 'From rooftop bars to ancient temples, every suggestion felt perfectly curated for us.', author: 'Aisha K.', location: 'Thailand' },
];

const Experiences = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-sm'
          : 'bg-transparent backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center">
              <Plane className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className={`font-display font-bold text-xl transition-colors duration-500 ${
              scrolled ? 'text-foreground' : 'text-primary-foreground'
            }`}>Wanderly</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Destinations', href: '/' },
              { label: 'Experiences', href: '/experiences' },
              { label: 'About', href: '/about' },
            ].map((item) => (
              <Link key={item.label} to={item.href} className={`text-sm font-medium transition-colors duration-500 ${
                scrolled
                  ? 'text-muted-foreground hover:text-foreground'
                  : 'text-primary-foreground/70 hover:text-primary-foreground'
              }`}>{item.label}</Link>
            ))}
          </nav>
          <Button
            variant="outline"
            size="sm"
            className={`rounded-full transition-all duration-500 ${
              !scrolled && 'border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10'
            }`}
          >
            Sign In
          </Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <img src={experiencesHero} alt="Hot air balloons over Cappadocia" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/50" />
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <span className="text-sm font-medium text-primary-foreground/80 uppercase tracking-widest mb-4 block">Curated by AI</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-5 leading-tight">
              Unforgettable Experiences
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              From adrenaline-fueled adventures to tranquil retreats, discover experiences tailored to your passions by our AI travel companion.
            </p>
          </div>
        </section>

        {/* Experience Categories Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-primary uppercase tracking-widest">Explore by Category</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
                Find Your Kind of Journey
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Every traveler is unique. Browse curated experience categories and let our AI match you with the perfect activities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {experiences.map((exp) => (
                <div
                  key={exp.title}
                  className="group relative rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-500 hover:-translate-y-2 border border-border/50"
                >
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <exp.icon className="h-4 w-4 text-primary-foreground/80" />
                      <span className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">{exp.title}</span>
                    </div>
                    <p className="text-primary-foreground/80 text-sm leading-relaxed mb-3">{exp.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {exp.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-primary-foreground/15 backdrop-blur-sm text-primary-foreground/90 border border-primary-foreground/10">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-primary uppercase tracking-widest">Personalized</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
                AI-Powered Curation
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Tell us your interests and we handle the rest — from hidden gems to bucket-list staples.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: '01', icon: Compass, title: 'Share Your Vibe', desc: 'Select your interests — adventure, food, culture, relaxation, or all of the above.' },
                { step: '02', icon: Star, title: 'Get AI Picks', desc: 'Our AI cross-references real-time data with your preferences to surface the best experiences.' },
                { step: '03', icon: MapPin, title: 'Explore & Enjoy', desc: 'Follow your personalized itinerary or freestyle — every recommendation is a click away.' },
              ].map((item) => (
                <div key={item.step} className="relative bg-card rounded-2xl p-7 shadow-soft border border-border/50 text-center">
                  <span className="absolute top-4 right-4 text-4xl font-bold text-muted/50 font-display">{item.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-primary uppercase tracking-widest">Traveler Stories</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
                What Explorers Say
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {featuredTestimonials.map((t, i) => (
                <div key={i} className="bg-card rounded-2xl p-7 shadow-soft border border-border/50">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground italic leading-relaxed mb-5">"{t.quote}"</p>
                  <div className="text-sm">
                    <span className="font-medium text-foreground">{t.author}</span>
                    <span className="text-muted-foreground"> · {t.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 relative overflow-hidden">
          <img src={experiencesHero} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/65" />
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Your Next Adventure Awaits
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8 text-lg">
              Enter your destination and let our AI curate the perfect experiences for you.
            </p>
            <Link to="/">
              <Button variant="hero" size="xl" className="rounded-xl">
                <Compass className="h-5 w-5" />
                Start Exploring
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Experiences;
