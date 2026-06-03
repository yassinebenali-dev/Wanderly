import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSubscription } from '@/hooks/useSubscription';
import { Loader2, CreditCard, Lock, ArrowLeft, Crown, Zap, Star, Check, Sparkles } from 'lucide-react';

const PLANS_CONFIG = {
  Free: {
    icon: Star,
    price: '0',
    color: '#6b7280',
    gradient: 'from-gray-400 to-gray-600',
    bg: 'from-gray-50 to-gray-100 dark:from-gray-900/80 dark:to-gray-800/60',
    border: 'border-gray-200 dark:border-gray-700',
    glow: 'shadow-gray-200 dark:shadow-gray-900',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    button: 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white',
    tag: 'Starter',
  },
  Gold: {
    icon: Zap,
    price: '9.99',
    color: '#d97706',
    gradient: 'from-amber-400 to-orange-500',
    bg: 'from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/40',
    border: 'border-amber-300 dark:border-amber-700',
    glow: 'shadow-amber-200 dark:shadow-amber-900',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white',
    tag: 'Most Popular',
  },
  Diamond: {
    icon: Crown,
    price: '24.99',
    color: '#2563eb',
    gradient: 'from-blue-500 to-indigo-600',
    bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/40',
    border: 'border-blue-400 dark:border-blue-700',
    glow: 'shadow-blue-200 dark:shadow-blue-900',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    button: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white',
    tag: 'Best Value',
  },
};

interface PaymentForm {
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvv: string;
}

export default function Subscription() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscriptionInfo, plans, loading, upgrading, fetchSubscriptionInfo, fetchPlans, changePlan, formatLimit, getUsagePercentage } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
  const [paymentError, setPaymentError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    fetchSubscriptionInfo();
    fetchPlans();
  }, [user]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    return v.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
  };

  const validatePayment = () => {
    const cardDigits = paymentForm.cardNumber.replace(/\s/g, '');
    if (cardDigits.length !== 16) return 'Card number must be 16 digits';
    if (!paymentForm.cardName.trim()) return 'Cardholder name is required';
    const [month, year] = paymentForm.expiry.split('/');
    if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1) return 'Invalid expiry date';
    if (paymentForm.cvv.length < 3) return 'CVV must be at least 3 digits';
    return null;
  };

  const handleSelectPlan = (planName: string) => {
    if (planName === subscriptionInfo?.plan.name) return;
    setSelectedPlan(planName);
    if (planName === 'Free') {
      handleDowngrade(planName);
    } else {
      setShowPayment(true);
      setPaymentError('');
      setPaymentForm({ cardNumber: '', cardName: '', expiry: '', cvv: '' });
    }
  };

  const handleDowngrade = async (planName: string) => {
    const result = await changePlan(planName);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  const handlePaymentSubmit = async () => {
    const error = validatePayment();
    if (error) { setPaymentError(error); return; }
    setProcessing(true);
    setPaymentError('');
    await new Promise(resolve => setTimeout(resolve, 2000));
    const result = await changePlan(selectedPlan!);
    setProcessing(false);
    if (result.success) {
      setShowPayment(false);
      setSuccess(true);
      setSelectedPlan(null);
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setPaymentError('Payment failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">Wanderly</span>
        </button>
        <div className="flex items-center gap-3">
          <ThemeToggle scrolled={true} />
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-16 max-w-6xl">

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">Unlock the full power of AI travel planning</p>
          {subscriptionInfo && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-primary font-medium">
                Active plan: <strong>{subscriptionInfo.plan.name}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Success */}
        {success && (
          <div className="mb-10 p-5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl text-center">
            <p className="text-green-700 dark:text-green-400 font-semibold text-lg">🎉 Plan updated successfully! Enjoy your new features.</p>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => {
            const config = PLANS_CONFIG[plan.name as keyof typeof PLANS_CONFIG];
            const Icon = config.icon;
            const isCurrent = subscriptionInfo?.plan.name === plan.name;
            const isGold = plan.name === 'Gold';

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border-2 ${config.border} overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${config.glow} ${isGold ? 'md:-translate-y-4 shadow-xl' : ''}`}
              >
                {/* Most Popular Badge */}
                {isGold && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold text-center py-2 tracking-widest uppercase">
                    ⭐ Most Popular
                  </div>
                )}

                {/* Card Background */}
                <div className={`bg-gradient-to-br ${config.bg} p-8 ${isGold ? 'pt-12' : ''} h-full`}>

                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-xl">{plan.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                        {config.tag}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-foreground">${config.price}</span>
                      {parseFloat(config.price) > 0 && (
                        <span className="text-muted-foreground text-sm mb-1">/month</span>
                      )}
                    </div>
                    {parseFloat(config.price) === 0 && (
                      <span className="text-muted-foreground text-sm">Forever free</span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className={`h-px bg-gradient-to-r ${config.gradient} opacity-30 mb-6`} />

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {[
                      { label: `${formatLimit(plan.max_searches)} searches/month`, available: true },
                      { label: `${formatLimit(plan.max_saved)} saved destinations`, available: true },
                      { label: `${formatLimit(plan.max_chat_messages)} chat messages/month`, available: true },
                      { label: `${formatLimit(plan.max_itineraries)} itineraries/month`, available: true },
                      { label: `${formatLimit(plan.max_checklists)} checklists/month`, available: true },
                      { label: `${formatLimit(plan.max_budgets)} budgets/month`, available: true },
          
                    ].map((feature) => (
                      <li key={feature.label} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                          feature.available ? `bg-gradient-to-br ${config.gradient}` : 'bg-muted dark:bg-muted/50'
                        }`}>
                          {feature.available
                            ? <Check className="h-3 w-3 text-white" />
                            : <span className="text-muted-foreground text-xs">✕</span>
                          }
                        </div>
                        <span className={`text-sm ${
                          feature.available
                            ? 'text-foreground'
                            : 'text-muted-foreground line-through'
                        }`}>
                          {feature.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <button
                    className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                      isCurrent
                        ? 'bg-muted dark:bg-muted/40 text-muted-foreground cursor-not-allowed'
                        : config.button + ' shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    disabled={isCurrent || upgrading}
                    onClick={() => handleSelectPlan(plan.name)}
                  >
                    {isCurrent ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Current Plan
                      </span>
                    ) : plan.name === 'Free' ? 'Downgrade to Free' : `Get ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Usage */}
        {subscriptionInfo && (
          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border bg-muted/20">
              <h2 className="font-display text-xl font-bold text-foreground">Your Usage This Month</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Plan: <strong>{subscriptionInfo.plan.name}</strong>
                {subscriptionInfo.expires_at ? (
                  <span className="ml-2 text-amber-600 dark:text-amber-400">
                    · Expires on {new Date(subscriptionInfo.expires_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                ) : (
                  <span className="ml-2 text-green-600 dark:text-green-400">· Free plan · No expiry</span>
                )}
              </p>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Searches', used: subscriptionInfo.usage.searches, limit: subscriptionInfo.plan.max_searches, emoji: '🔍' },
                { label: 'Saved Destinations', used: subscriptionInfo.usage.saved, limit: subscriptionInfo.plan.max_saved, emoji: '🔖' },
                { label: 'Chat Messages', used: subscriptionInfo.usage.chat_messages, limit: subscriptionInfo.plan.max_chat_messages, emoji: '💬' },
                { label: 'Itineraries', used: subscriptionInfo.usage.itineraries, limit: subscriptionInfo.plan.max_itineraries, emoji: '🗓️' },
                { label: 'Checklists', used: subscriptionInfo.usage.checklists, limit: subscriptionInfo.plan.max_checklists, emoji: '✅' },
                { label: 'Budgets', used: subscriptionInfo.usage.budgets, limit: subscriptionInfo.plan.max_budgets, emoji: '💰' },
              ].map((item) => {
                const percentage = getUsagePercentage(item.used, item.limit);
                const isWarning = percentage >= 70 && percentage < 90;
                const isDanger = percentage >= 90;
                return (
                  <div key={item.label} className="bg-muted/30 rounded-2xl p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                    <div className="flex justify-between items-end mb-2">
                      <span className={`text-2xl font-bold ${isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-foreground'}`}>
                        {item.used}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / {item.limit === -1 ? '∞' : item.limit}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-primary'}`}
                        style={{ width: `${item.limit === -1 ? 10 : percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-border">

            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${PLANS_CONFIG[selectedPlan as keyof typeof PLANS_CONFIG]?.gradient} p-6 text-white`}>
              <div className="flex items-center gap-3 mb-1">
                <CreditCard className="h-5 w-5" />
                <h3 className="font-bold text-lg">Complete Your Upgrade</h3>
              </div>
              <p className="text-white/70 text-sm">
                Upgrading to <strong>{selectedPlan}</strong> plan · ${PLANS_CONFIG[selectedPlan as keyof typeof PLANS_CONFIG]?.price}/month
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentForm.cardNumber}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: formatCardNumber(e.target.value) })}
                    className="w-full px-4 py-3.5 bg-muted/40 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 pr-12"
                    maxLength={19}
                  />
                  <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Card Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="eg: Yassine Benali "
                  value={paymentForm.cardName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value })}
                  className="w-full px-4 py-3.5 bg-muted/40 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={paymentForm.expiry}
                    onChange={(e) => setPaymentForm({ ...paymentForm, expiry: formatExpiry(e.target.value) })}
                    className="w-full px-4 py-3.5 bg-muted/40 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={paymentForm.cvv}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    className="w-full px-4 py-3.5 bg-muted/40 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    maxLength={4}
                  />
                </div>
              </div>

              {paymentError && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-red-600 dark:text-red-400 text-sm">
                  {paymentError}
                </div>
              )}

              {/* Security */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">
                <Lock className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                <span>256-bit SSL encryption · Your data is secure</span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 py-3.5 rounded-2xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                  onClick={() => { setShowPayment(false); setSelectedPlan(null); }}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  className={`flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white transition-all ${processing ? 'opacity-70 cursor-not-allowed' : ''} bg-gradient-to-r ${PLANS_CONFIG[selectedPlan as keyof typeof PLANS_CONFIG]?.gradient} shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
                  onClick={handlePaymentSubmit}
                  disabled={processing}
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Pay $${PLANS_CONFIG[selectedPlan as keyof typeof PLANS_CONFIG]?.price}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}