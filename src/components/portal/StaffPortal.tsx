'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ClipboardList, Calendar, User, LogOut, Menu, Eye, Clock, CheckCircle2, ArrowLeft,
  AlertCircle, Phone, Mail, Send, Star, MapPin, Users, TrendingUp, Sparkles, ChevronRight,
  Bell, Search, Filter, Briefcase, ArrowRight, Package, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

/* ──────────────────── constants ──────────────────── */

const sidebarItems = [
  { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { key: 'client-bookings' as const, label: 'Client Bookings', icon: BookOpen },
  { key: 'my-assignments' as const, label: 'My Assignments', icon: ClipboardList },
  { key: 'event-details' as const, label: 'Event Details', icon: Sparkles },
  { key: 'my-schedule' as const, label: 'My Schedule', icon: Calendar },
  { key: 'contact-client' as const, label: 'Contact Client', icon: Phone },
  { key: 'profile' as const, label: 'My Profile', icon: User },
];

const statusColors: Record<string, string> = {
  ASSIGNED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const statusDotColors: Record<string, string> = {
  ASSIGNED: 'bg-amber-400',
  IN_PROGRESS: 'bg-blue-500',
  COMPLETED: 'bg-emerald-500',
};

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const bannerMessages = [
  'Ready to create unforgettable experiences!',
  'Every event is a chance to shine!',
  'Your dedication makes the difference!',
  'Let\'s make today\'s events extraordinary!',
];

/* ──────────────────── component ──────────────────── */

export default function StaffPortal() {
  const store = useAppStore();
  const {
    currentUser, staffTab, setStaffTab, setCurrentPage, logout,
    events, setEvents, staffAssignments, setStaffAssignments, bookings,
    notifications, setNotifications, setSelectedEvent, setBookings,
  } = store;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientMsg, setClientMsg] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('ALL');
  const [eventSearch, setEventSearch] = useState('');
  const [eventCategoryFilter, setEventCategoryFilter] = useState('');
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', bio: '' });
  const [bannerMsg] = useState(() => bannerMessages[Math.floor(Math.random() * bannerMessages.length)]);

  const myAssignments = staffAssignments.filter(a => a.staffId === currentUser?.id);
  const activeTasks = myAssignments.filter(a => a.status === 'IN_PROGRESS');
  const upcomingTasks = myAssignments.filter(a => a.status === 'ASSIGNED');
  const completedTasks = myAssignments.filter(a => a.status === 'COMPLETED');
  const completionRate = myAssignments.length > 0
    ? Math.round((completedTasks.length / myAssignments.length) * 100)
    : 0;

  /* ─── data fetch ─── */
  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, assignRes, bookingsRes, notifsRes] = await Promise.all([
          fetch('/api/events').then(r => r.json()),
          fetch(`/api/staff?staffId=${currentUser.id}`).then(r => r.json()),
          fetch('/api/bookings').then(r => r.json()),
          fetch(`/api/notifications?userId=${currentUser.id}`).then(r => r.json()),
        ]);
        if (eventsRes.success) setEvents(eventsRes.events);
        if (assignRes.success) setStaffAssignments(assignRes.assignments);
        if (bookingsRes.success) setBookings(bookingsRes.bookings);
        if (notifsRes.success) setNotifications(notifsRes.notifications);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  /* ─── handlers ─── */
  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/staff', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Assignment ${status.replace('_', ' ').toLowerCase()}`);
        setStaffAssignments(staffAssignments.map(a => a.id === id ? { ...a, status } : a));
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleViewEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setCurrentPage('event-detail');
    }
  };

  const handleSendClientMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientMsg || !selectedClient) {
      toast.error('Please select a client and type a message');
      return;
    }
    toast.success('Message sent to client');
    setClientMsg('');
    setSelectedClient('');
  };

  /* ─── derived data for event details ─── */
  const categories = [...new Set(events.map(e => e.category))];
  const filteredEvents = events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
      e.category.toLowerCase().includes(eventSearch.toLowerCase());
    const matchCategory = !eventCategoryFilter || e.category === eventCategoryFilter;
    return matchSearch && matchCategory;
  });

  /* ─── derived data for contact client ─── */
  const clientBookings = bookings.filter(b =>
    myAssignments.some(a => a.eventId === b.eventId && b.user)
  );
  const uniqueClients = clientBookings
    .filter(b => b.user)
    .reduce((acc: any[], b) => {
      if (!acc.find(c => c.id === b.user!.id)) acc.push({ ...b.user!, event: b.event });
      return acc;
    }, []);

  /* ─── filtered assignments ─── */
  const filteredAssignments = assignmentFilter === 'ALL'
    ? myAssignments
    : myAssignments.filter(a => a.status === assignmentFilter);

  /* ═══════════════════════════════════════════════════
     SIDEBAR
     ═══════════════════════════════════════════════════ */
  const renderSidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold gold-gradient">EventPro</span>
            <p className="text-[10px] text-sidebar-foreground/40 uppercase tracking-widest font-medium">Staff Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = staffTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { setStaffTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-sidebar-foreground/60 hover:bg-white/5 hover:text-sidebar-foreground'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
              {item.key === 'dashboard' && notifications.filter(n => !n.isRead).length > 0 && (
                <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
              {item.key === 'client-bookings' && bookings.filter(b => b.status === 'PENDING').length > 0 && (
                <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {bookings.filter(b => b.status === 'PENDING').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User info */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <Avatar className="h-9 w-9 ring-2 ring-purple-500/50">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-sm font-bold">
              {currentUser?.name?.charAt(0) || 'S'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser?.name}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-purple-400">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              Staff
            </span>
          </div>
        </div>
        <button
          onClick={() => setCurrentPage('landing')}
          className="w-full mt-2 flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
        <button
          onClick={logout}
          className="w-full mt-2 flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════
     LOADING
     ═══════════════════════════════════════════════════ */
  const renderLoading = () => (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );

  /* ═══════════════════════════════════════════════════
     DASHBOARD TAB
     ═══════════════════════════════════════════════════ */
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700 p-6 sm:p-8 text-white"
      >
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-purple-400/20 blur-2xl" />
        <div className="absolute top-4 right-20 h-20 w-20 rounded-full bg-indigo-300/15 blur-xl" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-purple-200 text-sm font-medium mb-1">Welcome back,</p>
              <h1 className="text-2xl sm:text-3xl font-bold">{currentUser?.name} 🎉</h1>
              <p className="text-purple-200/80 mt-1.5 text-sm sm:text-base max-w-md">{bannerMsg}</p>
            </div>
            <div className="flex gap-3">
              <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-2xl font-bold">{myAssignments.length}</p>
                <p className="text-[11px] text-purple-200 font-medium">Assignments</p>
              </div>
              <div className="text-center bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3">
                <p className="text-2xl font-bold">{completionRate}%</p>
                <p className="text-[11px] text-purple-200 font-medium">Completion</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Active Tasks', value: activeTasks.length, icon: AlertCircle, color: 'from-amber-400 to-orange-500', bgLight: 'bg-amber-50 dark:bg-amber-950/40', progress: myAssignments.length > 0 ? (activeTasks.length / myAssignments.length) * 100 : 0, progressColor: 'bg-amber-400' },
          { label: 'Upcoming', value: upcomingTasks.length, icon: Clock, color: 'from-purple-400 to-violet-500', bgLight: 'bg-purple-50 dark:bg-purple-950/40', progress: myAssignments.length > 0 ? (upcomingTasks.length / myAssignments.length) * 100 : 0, progressColor: 'bg-purple-400' },
          { label: 'Completed', value: completedTasks.length, icon: CheckCircle2, color: 'from-emerald-400 to-teal-500', bgLight: 'bg-emerald-50 dark:bg-emerald-950/40', progress: completionRate, progressColor: 'bg-emerald-400' },
          { label: 'Total Events', value: events.length, icon: TrendingUp, color: 'from-blue-400 to-indigo-500', bgLight: 'bg-blue-50 dark:bg-blue-950/40', progress: 100, progressColor: 'bg-blue-400' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} variants={itemVariants}>
              <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-3xl font-bold">{s.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">{s.label}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.progress}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                      className={`h-full rounded-full ${s.progressColor}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Active Tasks ── */}
      {activeTasks.length > 0 && (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" />
              My Active Tasks
            </h2>
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700" onClick={() => setStaffTab('my-assignments')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeTasks.slice(0, 4).map((a, i) => (
              <motion.div key={a.id} variants={itemVariants}>
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Event image */}
                      <div className="relative w-full sm:w-44 h-32 shrink-0 overflow-hidden">
                        <img
                          src={a.event?.image || '/events/hero.jpg'}
                          alt={a.event?.title || 'Event'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 sm:bg-gradient-to-r sm:from-transparent sm:to-black/10" />
                        <Badge className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 text-[10px] font-semibold">
                          {a.event?.category || 'Event'}
                        </Badge>
                      </div>
                      {/* Info */}
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-sm line-clamp-1">{a.event?.title || 'Unknown Event'}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-[10px] px-2 py-0">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {a.role || 'Team Member'}
                            </Badge>
                            <Badge className={`${statusColors[a.status]} text-[10px] px-2 py-0`}>
                              {a.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          {a.notes && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{a.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline" className="h-8 text-xs flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700" onClick={() => handleUpdateStatus(a.id, 'COMPLETED')}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Complete
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleViewEvent(a.eventId)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Recent Notifications ── */}
      {notifications.length > 0 && (
        <motion.div variants={containerVariants} initial="hidden" animate="show">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-purple-500" />
            Recent Notifications
          </h2>
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-4 space-y-2 max-h-80 overflow-y-auto">
              {notifications.slice(0, 6).map((n, i) => (
                <motion.div
                  key={n.id}
                  variants={itemVariants}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                    n.isRead ? 'hover:bg-muted/50' : 'bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${
                    n.isRead ? 'bg-muted' : 'bg-purple-100 dark:bg-purple-900/50'
                  }`}>
                    <Bell className={`h-4 w-4 ${n.isRead ? 'text-muted-foreground' : 'text-purple-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.isRead ? 'text-muted-foreground' : 'font-medium'}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Quick Actions ── */}
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'View All Assignments', icon: ClipboardList, tab: 'my-assignments' as const, gradient: 'from-purple-500 to-indigo-600', desc: 'Manage your event assignments' },
            { label: 'My Schedule', icon: Calendar, tab: 'my-schedule' as const, gradient: 'from-blue-500 to-cyan-600', desc: 'View your upcoming timeline' },
            { label: 'Contact Client', icon: Phone, tab: 'contact-client' as const, gradient: 'from-emerald-500 to-teal-600', desc: 'Get in touch with clients' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div key={i} variants={itemVariants}>
                <button
                  onClick={() => setStaffTab(action.tab)}
                  className="w-full group"
                >
                  <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-0.5">
                    <CardContent className="p-5">
                      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm">{action.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                    </CardContent>
                  </Card>
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );

  /* ═══════════════════════════════════════════════════
     MY ASSIGNMENTS TAB
     ═══════════════════════════════════════════════════ */
  const renderMyAssignments = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Assignments</h1>
        <p className="text-muted-foreground mt-1">View and manage your event assignments</p>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'ALL', label: 'All', count: myAssignments.length },
          { key: 'ASSIGNED', label: 'Assigned', count: upcomingTasks.length },
          { key: 'IN_PROGRESS', label: 'In Progress', count: activeTasks.length },
          { key: 'COMPLETED', label: 'Completed', count: completedTasks.length },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setAssignmentFilter(f.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              assignmentFilter === f.key
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              assignmentFilter === f.key ? 'bg-white/20' : 'bg-muted-foreground/10'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Assignment Cards */}
      {filteredAssignments.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No assignments found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {assignmentFilter === 'ALL'
                ? 'You don\'t have any assignments yet. Check back later!'
                : `No ${assignmentFilter.replace('_', ' ').toLowerCase()} assignments at this time.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {filteredAssignments.map(a => (
            <motion.div key={a.id} variants={itemVariants}>
              <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group">
                {/* Event image with overlay */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={a.event?.image || '/events/hero.jpg'}
                    alt={a.event?.title || 'Event'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 text-[10px] font-semibold mb-2">
                      {a.event?.category || 'Event'}
                    </Badge>
                    <h3 className="text-white font-bold text-base line-clamp-1">{a.event?.title || 'Unknown Event'}</h3>
                  </div>
                  <Badge className={`absolute top-3 right-3 ${statusColors[a.status]} border-0 shadow-sm`}>
                    {a.status.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Content */}
                <CardContent className="p-4 space-y-3">
                  {/* Role & Notes */}
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{a.role || 'Team Member'}</span>
                  </div>
                  {a.notes && (
                    <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2.5 line-clamp-2">{a.notes}</p>
                  )}

                  {/* Timeline */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Assigned: {new Date(a.assignedAt).toLocaleDateString()}</span>
                    {a.completedAt && (
                      <>
                        <ChevronRight className="h-3 w-3" />
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Completed: {new Date(a.completedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    {a.status !== 'COMPLETED' && (
                      <Select value={a.status} onValueChange={(v) => handleUpdateStatus(a.id, v)}>
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ASSIGNED">Mark Assigned</SelectItem>
                          <SelectItem value="IN_PROGRESS">Mark In Progress</SelectItem>
                          <SelectItem value="COMPLETED">Mark Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                      onClick={() => handleViewEvent(a.eventId)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> View Event
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════
     EVENT DETAILS TAB (Browse Events)
     ═══════════════════════════════════════════════════ */
  const renderEventDetails = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Events</h1>
        <p className="text-muted-foreground mt-1">Explore all available events and services</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={eventCategoryFilter}
            onChange={(e) => setEventCategoryFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background pl-10 pr-8 text-sm appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Event Grid */}
      {filteredEvents.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No events found</h3>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredEvents.map(event => (
            <motion.div key={event.id} variants={itemVariants}>
              <Card
                className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
                onClick={() => handleViewEvent(event.id)}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={event.image || '/events/hero.jpg'}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 text-[10px] font-semibold shadow-sm">
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </Badge>
                  {event.isFeatured && (
                    <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 text-[10px] font-semibold shadow-sm">
                      <Star className="h-3 w-3 mr-0.5" /> Featured
                    </Badge>
                  )}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-8 w-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Eye className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">{event.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{event.shortDesc || event.description}</p>
                  <div className="flex items-center justify-between">
                    {event.priceRange && (
                      <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        {event.priceRange}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════
     MY SCHEDULE TAB
     ═══════════════════════════════════════════════════ */
  const renderMySchedule = () => {
    const now = new Date();
    const upcoming = myAssignments
      .filter(a => a.status !== 'COMPLETED')
      .sort((a, b) => new Date(a.assignedAt).getTime() - new Date(b.assignedAt).getTime());
    const past = myAssignments
      .filter(a => a.status === 'COMPLETED')
      .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());

    const currentMonth = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const renderTimelineItem = (a: typeof myAssignments[0], index: number) => (
      <motion.div
        key={a.id}
        variants={itemVariants}
        className="relative flex gap-4 group"
      >
        {/* Timeline line & dot */}
        <div className="flex flex-col items-center">
          <div className={`h-4 w-4 rounded-full ${statusDotColors[a.status] || 'bg-muted-foreground'} ring-4 ring-background shadow-md z-10 shrink-0 mt-1`} />
          <div className="w-0.5 flex-1 bg-gradient-to-b from-purple-200 to-transparent dark:from-purple-900/50" />
        </div>

        {/* Card */}
        <Card className="flex-1 mb-4 border-0 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group-hover:-translate-y-0.5">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              {/* Thumbnail */}
              <div className="relative w-full sm:w-28 h-24 sm:h-auto shrink-0 overflow-hidden">
                <img
                  src={a.event?.image || '/events/hero.jpg'}
                  alt={a.event?.title || 'Event'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
              </div>
              {/* Info */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{a.event?.title || 'Event'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] px-2 py-0">
                        {a.role || 'Team Member'}
                      </Badge>
                      <Badge className={`${statusColors[a.status]} text-[10px] px-2 py-0`}>
                        {a.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-purple-500 hover:text-purple-600 hover:bg-purple-50"
                    onClick={() => handleViewEvent(a.eventId)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(a.assignedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {a.completedAt && (
                    <>
                      <span className="text-muted-foreground/50">→</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{new Date(a.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </>
                  )}
                </div>
                {a.notes && (
                  <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded-lg p-2 line-clamp-2">{a.notes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground mt-1">Your assignment timeline at a glance</p>
        </div>

        {/* Calendar Header */}
        <Card className="border-0 shadow-sm overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-purple-200 font-medium">Current Period</p>
                <p className="text-lg font-bold">{currentMonth}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold">{upcoming.length}</p>
                <p className="text-[10px] text-purple-200">Upcoming</p>
              </div>
              <div className="w-px bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{past.length}</p>
                <p className="text-[10px] text-purple-200">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {myAssignments.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No schedule yet</h3>
              <p className="text-sm text-muted-foreground mt-1">Your assignments will appear here as a timeline</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-base font-bold flex items-center gap-2 mb-4 text-purple-700 dark:text-purple-400">
                  <Clock className="h-4 w-4" />
                  Upcoming & Active
                </h2>
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                  {upcoming.map((a, i) => renderTimelineItem(a, i))}
                </motion.div>
              </div>
            )}

            {/* Past / Completed */}
            {past.length > 0 && (
              <div>
                <h2 className="text-base font-bold flex items-center gap-2 mb-4 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </h2>
                <motion.div variants={containerVariants} initial="hidden" animate="show">
                  {past.map((a, i) => renderTimelineItem(a, i))}
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════
     CONTACT CLIENT TAB
     ═══════════════════════════════════════════════════ */
  const renderContactClient = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contact Client</h1>
        <p className="text-muted-foreground mt-1">View client details and communicate for your assigned events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Client Directory */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                Client Directory
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              {uniqueClients.length === 0 ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No clients found for your assignments</p>
                </div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
                  {uniqueClients.map((c) => {
                    const clientBooking = clientBookings.find(b => b.user?.id === c.id);
                    return (
                      <motion.div key={c.id} variants={itemVariants}>
                        <Card className="overflow-hidden border hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              {/* Avatar + Online indicator */}
                              <div className="relative shrink-0">
                                <Avatar className="h-14 w-14 ring-2 ring-purple-100 dark:ring-purple-900">
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-lg font-bold">
                                    {c.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-400 ring-2 ring-background" />
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm">{c.name}</h3>
                                <p className="text-xs text-muted-foreground">{c.email}</p>
                                {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 mt-2">
                                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setSelectedClient(c.id); }}>
                                    <Mail className="h-3 w-3" /> Email
                                  </Button>
                                  {c.phone && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => toast.info(`Calling ${c.phone}...`)}>
                                      <Phone className="h-3 w-3" /> Call
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* Event info */}
                              {c.event && (
                                <div className="hidden sm:block w-20 h-14 rounded-lg overflow-hidden shrink-0">
                                  <img
                                    src={c.event.image || '/events/hero.jpg'}
                                    alt={c.event.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Booking status */}
                            {clientBooking && (
                              <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                                <span className="line-clamp-1">
                                  <Briefcase className="h-3 w-3 inline mr-1" />
                                  {clientBooking.event?.title || 'Event'}
                                </span>
                                <Badge className={`text-[10px] px-2 py-0 ${
                                  clientBooking.status === 'CONFIRMED'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : clientBooking.status === 'PENDING'
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                      : 'bg-muted text-muted-foreground'
                                }`}>
                                  {clientBooking.status}
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Compose */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-purple-500" />
                Send Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendClientMsg} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Select Client</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a client..." />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueClients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Message</Label>
                  <Textarea
                    rows={5}
                    value={clientMsg}
                    onChange={(e) => setClientMsg(e.target.value)}
                    placeholder="Type your message to the client..."
                    className="resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/20 transition-all"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════════
     PROFILE TAB
     ═══════════════════════════════════════════════════ */
  const renderProfile = () => {
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (completionRate / 100) * circumference;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account and view performance</p>
        </div>

        {/* Profile Header Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-0 shadow-sm">
            {/* Gradient Background */}
            <div className="relative h-32 bg-gradient-to-br from-purple-600 via-indigo-600 to-violet-700">
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-indigo-400/20 blur-xl" />
            </div>
            <CardContent className="relative px-6 pb-6">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-2xl font-bold">
                    {currentUser?.name?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{currentUser?.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 text-[10px] font-semibold px-2.5">
                      STAFF
                    </Badge>
                    {currentUser?.phone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {currentUser.phone}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                  onClick={() => {
                    setProfileForm({ name: currentUser?.name || '', phone: currentUser?.phone || '', bio: currentUser?.bio || '' });
                    setProfileEdit(true);
                  }}
                >
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Assignments', value: myAssignments.length, icon: ClipboardList, gradient: 'from-purple-500 to-indigo-600' },
            { label: 'Completed', value: completedTasks.length, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-600' },
            { label: 'In Progress', value: activeTasks.length, icon: AlertCircle, gradient: 'from-blue-500 to-indigo-600' },
            { label: 'Upcoming', value: upcomingTasks.length, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} variants={itemVariants}>
                <Card className="border-0 shadow-sm overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Completion Rate Circle */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Completion Rate
              </h3>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 96 96">
                    {/* Background circle */}
                    <circle cx="48" cy="48" r="40" fill="none" stroke="oklch(0.93 0.03 155 / 0.3)" strokeWidth="8" />
                    {/* Progress circle */}
                    <circle
                      cx="48" cy="48" r="40" fill="none"
                      stroke="url(#purpleGradient)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="oklch(0.63 0.25 295)" />
                        <stop offset="100%" stopColor="oklch(0.55 0.24 265)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{completionRate}%</span>
                    <span className="text-[10px] text-muted-foreground">Complete</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Info (editable) */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-purple-500" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!profileEdit ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Name</span>
                    <span className="font-medium">{currentUser?.name || 'Not set'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Email</span>
                    <span className="font-medium">{currentUser?.email}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">Phone</span>
                    <span className="font-medium">{currentUser?.phone || 'Not set'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-start text-sm">
                    <span className="text-muted-foreground font-medium mt-0.5">Bio</span>
                    <span className="font-medium text-right max-w-xs">{currentUser?.bio || 'Not set'}</span>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  setProfileEdit(false);
                  toast.success('Profile updated successfully');
                }}>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Name</Label>
                    <Input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Phone</Label>
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Enter phone number" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Bio</Label>
                    <Textarea rows={3} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Tell us about yourself..." className="resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/20">
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setProfileEdit(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════
     CLIENT BOOKINGS TAB
     ═══════════════════════════════════════════════════ */
  const renderClientBookings = () => {
    const pendingBookings = bookings.filter(b => b.status === 'PENDING');
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Client Bookings</h2>
          <p className="text-muted-foreground">Manage recent booking requests from clients.</p>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 gap-4">
          {pendingBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border shadow-sm">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No pending booking requests.</p>
            </div>
          ) : (
             pendingBookings.map(b => (
               <motion.div key={b.id} variants={itemVariants}>
                 <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                   <CardContent className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                     <div>
                       <Badge className="mb-2 bg-blue-100 text-blue-800 border-0">{b.status}</Badge>
                       <h3 className="text-lg font-semibold">{b.event?.title || b.eventType}</h3>
                       <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                         <User className="h-3.5 w-3.5" /> {b.user?.name || 'Unknown Client'}
                         <span className="text-muted-foreground/50">•</span>
                         <Calendar className="h-3.5 w-3.5" /> {b.eventDate || 'No date set'}
                       </p>
                       {b.message && (
                         <div className="mt-3 text-sm italic text-muted-foreground">
                           <span className="font-semibold text-foreground not-italic mr-1">Message:</span>"{b.message}"
                         </div>
                       )}
                     </div>
                     <div className="flex gap-2 w-full md:w-auto shrink-0">
                        <Button className="w-full md:w-auto rounded-xl" variant="outline" onClick={() => {
                           toast.info('Booking review in progress. Staff action required.');
                        }}>
                          Review Request
                        </Button>
                     </div>
                   </CardContent>
                 </Card>
               </motion.div>
             ))
          )}
        </motion.div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════════
     CONTENT ROUTER
     ═══════════════════════════════════════════════════ */
  const renderContent = () => {
    if (loading) return renderLoading();
    switch (staffTab) {
      case 'dashboard': return renderDashboard();
      case 'client-bookings': return renderClientBookings();
      case 'my-assignments': return renderMyAssignments();
      case 'event-details': return renderEventDetails();
      case 'my-schedule': return renderMySchedule();
      case 'contact-client': return renderContactClient();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  /* ═══════════════════════════════════════════════════
     MAIN RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-sidebar text-sidebar-foreground border-r shrink-0 h-screen sticky top-0">
        {renderSidebar()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b px-4 py-3 flex items-center justify-between">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-purple-600">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {renderSidebar()}
            </SheetContent>
          </Sheet>
          <span className="font-semibold gold-gradient">EventPro Staff</span>
          <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 text-[10px] font-semibold">
            STAFF
          </Badge>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={staffTab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
