import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import Experiences from "./pages/Experiences";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Admin from './pages/Admin';
import Subscription from '@/pages/Subscription';
import SearchHistory from './pages/SearchHistory';
import SavedDestinations from "./pages/SavedDestinations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster  />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/saved" element={<SavedDestinations />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/search-history" element={<SearchHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;