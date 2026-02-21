import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Plane, Globe, Users, Star, Compass, MapPin, Shield, Zap,
  Heart, Clock, Award, CheckCircle, Mail, Phone, MessageCircle,
  ArrowRight, Sparkles, TrendingUp, Map
} from 'lucide-react';
import aboutHero from '@/assets/about-hero.jpg';
import aboutMission from '@/assets/about-mission.jpg';
import aboutCta from '@/assets/about-cta.jpg';
import aboutFeatures from '@/assets/about-features.jpg';
import aboutAdvantage from '@/assets/about-advantage.jpg';

const About = () => {
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
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center">
              <Plane className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className={`font-display font-bold text-xl transition-colors ${scrolled ? 'text-foreground' : 'text-primary-foreground'}`}>Wanderly</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-medium transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-primary-foreground/80 hover:text-primary-foreground'}`}>Home</Link>
            <span className={`text-sm font-medium ${scrolled ? 'text-foreground' : 'text-primary-foreground'}`}>About</span>
          </nav>
          <Link to="/">
            <Button variant="outline" size="sm" className={`rounded-full ${scrolled ? '' : 'border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10'}`}>
              Start Planning
            </Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero with background image */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <img src={aboutHero} alt="Mediterranean coastline at sunset" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/55" />
          <div className="container mx-auto px-4 relative z-10 text-center py-32">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/15 backdrop-blur-sm text-primary-foreground text-sm font-medium mb-6 border border-primary-foreground/20">
              <Sparkles className="h-4 w-4" />
              About Wanderly
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Redefining Travel with{' '}
              <span className="text-accent">Artificial Intelligence</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/85 leading-relaxed max-w-2xl mx-auto">
              Wanderly is an AI-powered travel companion that transforms how you discover, plan, and experience destinations around the world.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 relative -mt-16 z-20">
          <div className="container mx-auto px-4">
            <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-card border border-border/50 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Globe, value: '500+', label: 'Destinations Covered' },
                { icon: Users, value: '50,000+', label: 'Happy Travelers' },
                { icon: Star, value: '4.9/5', label: 'User Rating' },
                { icon: TrendingUp, value: '2M+', label: 'Recommendations Made' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                  <p className="text-3xl md:text-4xl font-bold text-foreground font-display">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission with side image */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-sm font-medium text-primary uppercase tracking-widest">Our Mission</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-6">
                  Making Every Journey Unforgettable
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  We believe travel should be personal, not generic. Wanderly uses advanced AI to understand your unique preferences — from budget and travel style to hidden interests — and crafts recommendations that feel handpicked just for you.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Whether you're a solo adventurer seeking off-the-beaten-path experiences or a family looking for the perfect resort, our platform adapts to deliver exactly what you need.
                </p>
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-card">
                <img src={aboutMission} alt="European village street at golden hour" className="w-full h-80 md:h-[28rem] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 grid grid-cols-2 gap-3">
                  {[
                    { icon: Heart, title: 'Personalized' },
                    { icon: Zap, title: 'Instant' },
                    { icon: Shield, title: 'Trusted' },
                    { icon: Clock, title: '24/7 Support' },
                  ].map((item) => (
                    <div key={item.title} className="bg-card/80 backdrop-blur-md rounded-xl p-3 border border-border/30">
                      <item.icon className="h-5 w-5 text-primary mb-1" />
                      <h3 className="font-display font-semibold text-foreground text-sm">{item.title}</h3>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features List */}
        <section className="py-20 relative overflow-hidden">
          <img src={aboutFeatures} alt="Travel planning flat lay" className="absolute inset-0 w-full h-full object-cover opacity-[0.06]" />
          <div className="absolute inset-0 bg-muted/60" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="text-sm font-medium text-primary uppercase tracking-widest">Platform Features</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
                Everything You Need to Travel Smarter
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Map, title: 'Smart Destination Discovery', desc: 'AI analyzes thousands of destinations to match your preferences, season, and budget.' },
                { icon: MessageCircle, title: 'Conversational AI Assistant', desc: 'Chat naturally with our AI to refine your travel plans and get instant answers.' },
                { icon: Compass, title: 'Local Experience Curation', desc: 'Discover hidden gems, local restaurants, and authentic experiences beyond tourist traps.' },
                { icon: Award, title: 'Curated Accommodations', desc: 'From boutique hotels to luxury resorts, find stays that match your exact style.' },
                { icon: Globe, title: 'Cultural & Historical Insights', desc: 'Deep-dive into the history, traditions, and culture of every destination.' },
                { icon: MapPin, title: 'Real-Time Location Data', desc: 'Live information on places, reviews, hours, and availability powered by SerpAPI.' },
              ].map((feature) => (
                <div key={feature.title} className="flex gap-4 bg-card/90 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-soft hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 relative overflow-hidden">
          <img src={aboutAdvantage} alt="Aerial ocean view" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/92" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-sm font-medium text-primary uppercase tracking-widest">Why Wanderly</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3">
                  The Wanderly Advantage
                </h2>
              </div>

              <div className="space-y-5">
                {[
                  'AI-powered recommendations that learn from your preferences over time',
                  'Real-time data integration for accurate pricing, reviews, and availability',
                  'Covers accommodations, restaurants, activities, and cultural history in one place',
                  'Natural conversational interface — just chat like you would with a travel expert',
                  'Supports 500+ destinations worldwide with continuously expanding coverage',
                  'Completely free to use with no hidden fees or booking commissions',
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-4 bg-card/80 backdrop-blur-sm rounded-xl p-5 border border-border/50 shadow-soft">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <span className="text-sm font-medium text-primary uppercase tracking-widest">Get in Touch</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-3 mb-4">
                  We'd Love to Hear From You
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Have questions, feedback, or partnership inquiries? Reach out to our team.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { icon: Mail, title: 'Email Us', value: 'hello@wanderly.ai', subtitle: 'We reply within 24 hours' },
                  { icon: Phone, title: 'Call Us', value: '+1 (555) 123-4567', subtitle: 'Mon–Fri, 9am–6pm PST' },
                  { icon: MapPin, title: 'Visit Us', value: 'San Francisco, CA', subtitle: 'United States' },
                ].map((contact) => (
                  <div key={contact.title} className="bg-card rounded-xl p-6 border border-border/50 shadow-soft text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <contact.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-1">{contact.title}</h3>
                    <p className="text-foreground font-medium text-sm">{contact.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{contact.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA with background image */}
        <section className="relative py-28 overflow-hidden">
          <img src={aboutCta} alt="Santorini sunset panorama" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/60" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
              Ready to Explore the World?
            </h2>
            <p className="text-primary-foreground/85 max-w-xl mx-auto mb-8 text-lg">
              Start planning your next adventure with Wanderly's AI-powered travel companion.
            </p>
            <Link to="/">
              <Button variant="hero" size="xl" className="rounded-xl">
                <ArrowRight className="h-5 w-5" />
                Start Your Journey
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
