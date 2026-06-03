import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Plane, Users, Bookmark, TrendingUp, Trash2, LogOut,
  Search, BarChart2, Crown, DollarSign, Zap, Star,
  AlertTriangle, ArrowUpRight, Calendar
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalSaved: number;
  totalSearches: number;
  globalSaveRate: number;
  topSearched: { destination: string; search_count: number; save_count: number }[];
  topSaved: { destination: string; search_count: number; save_count: number }[];
  recentUsers: { id: number; email: string; display_name: string; role: string; created_at: string }[];
}

interface SubscriptionStats {
  planDistribution: { plan_name: string; count: number }[];
  totalPaying: number;
  totalUsers: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  allTimeRevenue: number;
  recentUpgrades: { email: string; display_name: string; plan_name: string; started_at: string; expires_at: string }[];
  monthlyUpgrades: { month: string; upgrades: number; revenue: number }[];
  expiringSoon: number;
}

interface User {
  id: number;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
  plan_name?: string;
}

interface SavedItem {
  id: number;
  destination: string;
  budget: number;
  created_at: string;
  email: string;
  display_name: string;
}

interface DestinationStat {
  destination: string;
  search_count: number;
  save_count: number;
  last_searched: string;
}

const PLAN_COLORS: Record<string, string> = {
  Free: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  Gold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  Diamond: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
};

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'subscriptions' | 'users' | 'saved' | 'destinations'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [destinationStats, setDestinationStats] = useState<DestinationStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    if (user.role !== 'admin') { navigate('/'); return; }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await apiRequest('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStats = async () => {
    try {
      const data = await apiRequest('/admin/subscription-stats');
      setSubscriptionStats(data);
    } catch (err) {
      console.error('Failed to fetch subscription stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiRequest('/admin/users');
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchSaved = async () => {
    try {
      const data = await apiRequest('/admin/saved');
      setSaved(data.saved);
    } catch (err) {
      console.error('Failed to fetch saved:', err);
    }
  };

  const fetchDestinationStats = async () => {
    try {
      const data = await apiRequest('/admin/destination-stats');
      setDestinationStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch destination stats:', err);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'users') fetchUsers();
    if (tab === 'saved') fetchSaved();
    if (tab === 'destinations') fetchDestinationStats();
    if (tab === 'subscriptions') fetchSubscriptionStats();
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    return new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="bg-card border-b border-border px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg hero-gradient flex items-center justify-center">
            <Plane className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">Wanderly</span>
          <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden md:block">{user?.email}</span>
          <ThemeToggle scrolled={true} />
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>Back to App</Button>
          <Button variant="outline" size="sm" onClick={() => { signOut(); navigate('/auth'); }}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage users and monitor platform activity</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border overflow-x-auto">
          {[
            { key: 'stats', label: 'Overview', icon: TrendingUp },
            { key: 'subscriptions', label: 'Subscriptions', icon: Crown },
            { key: 'users', label: 'Users', icon: Users },
            { key: 'saved', label: 'Saved Destinations', icon: Bookmark },
            { key: 'destinations', label: 'Destination Stats', icon: BarChart2 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: Users, label: 'Total Users', value: stats.totalUsers },
                { icon: Search, label: 'Total Searches', value: stats.totalSearches },
                { icon: Bookmark, label: 'Total Saved', value: stats.totalSaved },
                { icon: TrendingUp, label: 'Global Save Rate', value: `${stats.globalSaveRate}%`, sub: 'of searches lead to a save' },
              ].map((card) => (
                <div key={card.label} className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm">{card.label}</span>
                  </div>
                  <p className="text-4xl font-bold text-foreground">{card.value}</p>
                  {card.sub && <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />Most Searched
                </h2>
                {stats.topSearched.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topSearched.map((dest, i) => (
                      <div key={dest.destination} className="flex items-center gap-4">
                        <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{dest.destination}</span>
                            <span className="text-sm text-muted-foreground">{dest.search_count} searches</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${(dest.search_count / stats.topSearched[0].search_count) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" />Most Saved
                </h2>
                {stats.topSaved.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.topSaved.map((dest, i) => (
                      <div key={dest.destination} className="flex items-center gap-4">
                        <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{dest.destination}</span>
                            <span className="text-sm text-muted-foreground">{dest.save_count} saves</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${(dest.save_count / stats.topSaved[0].save_count) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />Recent Signups
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.recentUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="py-3 text-foreground">{u.display_name || '—'}</td>
                      <td className="py-3 text-muted-foreground">{u.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-8">
            {!subscriptionStats ? (
              <div className="text-center py-12 text-muted-foreground">Loading subscription stats...</div>
            ) : (
              <>
                {/* Revenue Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-muted-foreground text-sm">Monthly Revenue</span>
                    </div>
                    <p className="text-4xl font-bold text-foreground">${subscriptionStats.monthlyRevenue}</p>
                    <p className="text-xs text-muted-foreground mt-1">Current active subscribers</p>
                  </div>

                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-muted-foreground text-sm">Yearly Revenue</span>
                    </div>
                    <p className="text-4xl font-bold text-foreground">${subscriptionStats.yearlyRevenue}</p>
                    <p className="text-xs text-muted-foreground mt-1">Revenue this year</p>
                  </div>

                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <BarChart2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-muted-foreground text-sm">All-Time Revenue</span>
                    </div>
                    <p className="text-4xl font-bold text-foreground">${subscriptionStats.allTimeRevenue}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total revenue generated</p>
                  </div>

                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-muted-foreground text-sm">Paying Subscribers</span>
                    </div>
                    <p className="text-4xl font-bold text-foreground">{subscriptionStats.totalPaying}</p>
                    <p className="text-xs text-muted-foreground mt-1">Active Gold & Diamond users</p>
                  </div>
                </div>

                {/* Plan Distribution + Expiring Soon */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Plan Distribution */}
                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />Plan Distribution
                    </h2>
                    <div className="space-y-4">
                      {subscriptionStats.planDistribution.map((plan) => {
                        const total = subscriptionStats.planDistribution.reduce((s, p) => s + p.count, 0);
                        const percentage = total > 0 ? Math.round((plan.count / total) * 100) : 0;
                        const Icon = plan.plan_name === 'Diamond' ? Crown : plan.plan_name === 'Gold' ? Zap : Star;
                        return (
                          <div key={plan.plan_name}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${plan.plan_name === 'Diamond' ? 'text-blue-500' : plan.plan_name === 'Gold' ? 'text-amber-500' : 'text-gray-400'}`} />
                                <span className="text-sm font-medium text-foreground">{plan.plan_name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${PLAN_COLORS[plan.plan_name]}`}>
                                  {plan.count} users
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-foreground">{percentage}%</span>
                            </div>
                            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  plan.plan_name === 'Diamond' ? 'bg-blue-500' :
                                  plan.plan_name === 'Gold' ? 'bg-amber-500' : 'bg-gray-400'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expiring Soon + Monthly Upgrades */}
                  <div className="space-y-4">
                    {/* Expiring Soon */}
                    <div className={`rounded-2xl p-6 border ${subscriptionStats.expiringSoon > 0 ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' : 'bg-card border-border'}`}>
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-6 w-6 ${subscriptionStats.expiringSoon > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />
                        <div>
                          <h3 className="font-semibold text-foreground">Expiring in 7 Days</h3>
                          <p className="text-sm text-muted-foreground">
                            {subscriptionStats.expiringSoon > 0
                              ? `${subscriptionStats.expiringSoon} subscription${subscriptionStats.expiringSoon > 1 ? 's' : ''} expiring soon`
                              : 'No subscriptions expiring soon'}
                          </p>
                        </div>
                        <span className={`ml-auto text-3xl font-bold ${subscriptionStats.expiringSoon > 0 ? 'text-amber-500' : 'text-foreground'}`}>
                          {subscriptionStats.expiringSoon}
                        </span>
                      </div>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-card rounded-2xl p-6 border border-border">
                      <div className="flex items-center gap-3 mb-1">
                        <ArrowUpRight className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-foreground">Conversion Rate</h3>
                      </div>
                      {(() => {
                        const total = subscriptionStats.totalUsers;
                        const rate = total > 0 ? Math.round((subscriptionStats.totalPaying / total) * 100) : 0;
                        return (
                          <>
                            <p className="text-4xl font-bold text-green-500 mt-2">{rate}%</p>
                            <p className="text-xs text-muted-foreground mt-1">Free users converted to paid plans</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Monthly Revenue Chart */}
                {subscriptionStats.monthlyUpgrades.length > 0 && (
                  <div className="bg-card rounded-2xl p-6 border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />Revenue Last 6 Months
                    </h2>
                    <div className="space-y-3">
                      {subscriptionStats.monthlyUpgrades.map((m) => {
                        const maxRevenue = Math.max(...subscriptionStats.monthlyUpgrades.map(x => x.revenue));
                        const percentage = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                        return (
                          <div key={m.month} className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground w-20 shrink-0">{formatMonth(m.month)}</span>
                            <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-accent rounded-lg transition-all duration-700"
                                style={{ width: `${percentage}%` }}
                              />
                              <span className="absolute inset-0 flex items-center px-3 text-xs font-medium text-foreground">
                                {m.upgrades} upgrade{m.upgrades !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-foreground w-16 text-right">${parseFloat(m.revenue.toString()).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent Upgrades */}
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Crown className="h-5 w-5 text-primary" />Recent Upgrades
                  </h2>
                  {subscriptionStats.recentUpgrades.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No upgrades yet</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground border-b border-border">
                          <th className="pb-3 font-medium">User</th>
                          <th className="pb-3 font-medium">Plan</th>
                          <th className="pb-3 font-medium">Upgraded On</th>
                          <th className="pb-3 font-medium">Expires On</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {subscriptionStats.recentUpgrades.map((u, i) => (
                          <tr key={i} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3">
                              <p className="text-foreground font-medium">{u.display_name || '—'}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PLAN_COLORS[u.plan_name]}`}>
                                {u.plan_name}
                              </span>
                            </td>
                            <td className="py-3 text-muted-foreground">{formatDate(u.started_at)}</td>
                            <td className="py-3 text-muted-foreground">
                              {u.expires_at ? formatDate(u.expires_at) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Plan</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">#{u.id}</td>
                    <td className="px-6 py-4 text-foreground">{u.display_name || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[u.plan_name || 'Free']}`}>
                        {u.plan_name || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-4">
                      {u.role !== 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:border-red-200"
                          onClick={() => handleDeleteUser(u.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Saved Destinations Tab */}
        {activeTab === 'saved' && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
                  <th className="px-6 py-4 font-medium">Destination</th>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Budget</th>
                  <th className="px-6 py-4 font-medium">Saved On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {saved.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{item.destination}</td>
                    <td className="px-6 py-4 text-foreground">{item.display_name || '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.email}</td>
                    <td className="px-6 py-4 text-muted-foreground">{item.budget ? `$${item.budget}` : '—'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Destination Stats Tab */}
        {activeTab === 'destinations' && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border bg-muted/30">
                  <th className="px-6 py-4 font-medium">Destination</th>
                  <th className="px-6 py-4 font-medium">Searches</th>
                  <th className="px-6 py-4 font-medium">Saves</th>
                  <th className="px-6 py-4 font-medium">Save Rate</th>
                  <th className="px-6 py-4 font-medium">Last Searched</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {destinationStats.map((item) => (
                  <tr key={item.destination} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{item.destination}</td>
                    <td className="px-6 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />{item.search_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />{item.save_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.search_count > 0 && (item.save_count / item.search_count) >= 0.5
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {item.search_count > 0 ? `${Math.round((item.save_count / item.search_count) * 100)}%` : '0%'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(item.last_searched)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;