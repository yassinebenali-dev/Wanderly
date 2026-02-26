import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import authBackground from '@/assets/auth-background.jpg';

const emailSchema = z.string().trim().email('Please enter a valid email').max(255);
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters').max(128);
const nameSchema = z.string().trim().max(100).optional();

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return;
    }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(emailResult.data, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back!');
          navigate('/');
        }
      } else {
        const nameResult = nameSchema.safeParse(displayName);
        const { error } = await signUp(emailResult.data, password, nameResult.success ? nameResult.data : undefined);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created successfully!');
          navigate('/auth');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Fullscreen background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBackground})` }}
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/90 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
            <Plane className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">Wanderly</span>
        </div>
      </button>

      {/* Auth card */}
      <Card className="relative z-10 w-full max-w-md mx-4 border-white/10 bg-background/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="font-display text-3xl">{isLogin ? 'Welcome back' : 'Create account'}</CardTitle>
            <CardDescription className="text-base">
              {isLogin ? 'Sign in to continue your journey' : 'Start planning your next adventure'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={100}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={128}
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <span className="text-primary font-medium">{isLogin ? 'Sign Up' : 'Sign In'}</span>
              </button>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default Auth;
