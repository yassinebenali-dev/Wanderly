import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle({ scrolled = false }: { scrolled?: boolean }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center w-16 h-8 rounded-full p-1 transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-slate-700 border border-slate-600'
          : scrolled
            ? 'bg-muted border border-border'
            : 'bg-white/20 border border-white/30'
      }`}
      aria-label="Toggle theme"
    >
      <Sun className={`h-3.5 w-3.5 absolute left-1.5 transition-all duration-300 ${
        theme === 'dark' ? 'text-slate-400' : 'text-amber-500'
      }`} />
      <Moon className={`h-3.5 w-3.5 absolute right-1.5 transition-all duration-300 ${
        theme === 'dark' ? 'text-blue-300' : 'text-slate-400'
      }`} />
      <div className={`w-6 h-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
        theme === 'dark' ? 'translate-x-8 bg-slate-900' : 'translate-x-0 bg-white'
      }`}>
        {theme === 'dark'
          ? <Moon className="h-3 w-3 text-blue-300" />
          : <Sun className="h-3 w-3 text-amber-500" />
        }
      </div>
    </button>
  );
}