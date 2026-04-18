import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plane, Users, Bookmark, TrendingUp, Trash2, LogOut, Search, BarChart2 } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalSaved: number;
  totalSearches: number;
  globalSaveRate: number;
  topSearched: { destination: string; search_count: number; save_count: number }[];
  topSaved: { destination: string; search_count: number; save_count: number }[];
  recentUsers: { id: number; email: string; display_name: string; role: string; created_at: string }[];
}

interface User {
  id: number;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
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

const Admin = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'saved' | 'destinations'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [destinationStats, setDestinationStats] = useState<DestinationStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
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

  const handleTabChange = (tab: 'stats' | 'users' | 'saved' | 'destinations') => {
    setActiveTab(tab);
    if (tab === 'users') fetchUsers();
    if (tab === 'saved') fetchSaved();
    if (tab === 'destinations') fetchDestinationStats();
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
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Back to App
          </Button>
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
        <div className="flex gap-2 mb-8 border-b border-border">
          {[
            { key: 'stats', label: 'Overview', icon: TrendingUp },
            { key: 'users', label: 'Users', icon: Users },
            { key: 'saved', label: 'Saved Destinations', icon: Bookmark },
            { key: 'destinations', label: 'Destination Stats', icon: BarChart2 },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">Total Users</span>
                </div>
                <p className="text-4xl font-bold text-foreground">{stats.totalUsers}</p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">Total Searches</span>
                </div>
                <p className="text-4xl font-bold text-foreground">{stats.totalSearches}</p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bookmark className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">Total Saved</span>
                </div>
                <p className="text-4xl font-bold text-foreground">{stats.totalSaved}</p>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-muted-foreground text-sm">Global Save Rate</span>
                </div>
                <p className="text-4xl font-bold text-foreground">{stats.globalSaveRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">of searches lead to a save</p>
              </div>
            </div>

            {/* Top Searched & Top Saved side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Searched */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" />
                  Most Searched
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
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(dest.search_count / stats.topSearched[0].search_count) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Saved */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" />
                  Most Saved
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
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(dest.save_count / stats.topSaved[0].save_count) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Recent Signups
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
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
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
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {u.role}
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
                    <td className="px-6 py-4 text-muted-foreground">
                      {item.budget ? `$${item.budget}` : '—'}
                    </td>
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
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.search_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      <div className="flex items-center gap-2">
                        <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                        {item.save_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.search_count > 0 && (item.save_count / item.search_count) >= 0.5
                          ? 'bg-green-100 text-green-700'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {item.search_count > 0
                          ? `${Math.round((item.save_count / item.search_count) * 100)}%`
                          : '0%'}
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