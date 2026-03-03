import { Plane, ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand — wider column */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
                <Plane className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">Wanderly</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              AI-powered travel planning that understands your style and delivers experiences you'll remember.
            </p>
          </div>

          {/* Links columns */}
          {[
            { title: 'Explore', items: ['Destinations', 'Experiences', 'Travel Guides', 'Hidden Gems'] },
            { title: 'Company', items: ['About', 'Careers', 'Blog', 'Press'] },
            { title: 'Contact', items: ['hello@wanderly.tn', 'Ben Arous, Tunisia'] },
          ].map((col) => (
            <div key={col.title} className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group">
                      {item}
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Wanderly
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <a key={item} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
