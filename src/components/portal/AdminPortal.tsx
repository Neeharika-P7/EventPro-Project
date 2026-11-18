'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CalendarDays, CalendarCheck, Users, UserPlus, ClipboardList, ArrowLeft,
  CreditCard, MessageSquare, User, LogOut, Menu, Plus, Edit, Trash2, Check, Ban,
  Eye, Filter, Search, Star, TrendingUp, DollarSign, Clock, Package, AlertCircle,
  CheckCircle2, BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight,
  Settings, Bell, Image as ImageIcon, X, Grid3X3, List, Mail, Phone, MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAppStore, type PortalTab } from '@/store/useAppStore';
import { toast } from 'sonner';

const sidebarItems = [
  { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, badge: '' },
  { key: 'manage-events' as const, label: 'Manage Events', icon: CalendarDays, badge: '' },
  { key: 'manage-bookings' as const, label: 'Manage Bookings', icon: CalendarCheck, badge: '' },
  { key: 'manage-staff' as const, label: 'Manage Staff', icon: Users, badge: '' },
  { key: 'staff-assignments' as const, label: 'Staff Assignments', icon: ClipboardList, badge: '' },
  { key: 'payments' as const, label: 'Payments', icon: CreditCard, badge: '' },
  { key: 'messages' as const, label: 'Messages', icon: MessageSquare, badge: 'messages' as const },
  { key: 'profile' as const, label: 'Profile', icon: User, badge: '' },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
  ASSIGNED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50',
  REFUNDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50',
};

const statusDotColors: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-emerald-500',
  CANCELLED: 'bg-red-500',
  COMPLETED: 'bg-blue-500',
  ASSIGNED: 'bg-purple-500',
  IN_PROGRESS: 'bg-amber-500',
  PAID: 'bg-emerald-500',
  FAILED: 'bg-red-500',
  REFUNDED: 'bg-orange-500',
};

const eventCategories = ['wedding', 'corporate', 'birthday', 'webinar', 'party', 'conference', 'babyshower', 'anniversary', 'cultural', 'productlaunch', 'graduation'];

const categoryColors: Record<string, string> = {
  wedding: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  corporate: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  birthday: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  webinar: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  party: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  conference: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  babyshower: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  anniversary: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cultural: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  productlaunch: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  graduation: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const stagger = {
  container: { transition: { staggerChildren: 0.08 } },
  item: { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } },
};

export default function AdminPortal() {
  const store = useAppStore();
  const {
    currentUser, adminTab, setAdminTab, setCurrentPage, logout,
    events, setEvents, bookings, setBookings, notifications, setNotifications,
    setStaffAssignments, setSelectedEvent, staffAssignments,
    contactMessages, setContactMessages,
  } = store;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '', slug: '', description: '', shortDesc: '', category: 'wedding',
    priceRange: '', duration: '', capacity: '', image: '', isFeatured: false,
  });
  const [assignForm, setAssignForm] = useState({ eventId: '', staffId: '', role: 'Coordinator', notes: '' });
  const [staffList, setStaffList] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [eventsViewMode, setEventsViewMode] = useState<'grid' | 'table'>('grid');
  const [bookingsViewMode, setBookingsViewMode] = useState<'cards' | 'table'>('cards');

  const unreadMessages = useMemo(() => contactMessages.filter(m => !m.isRead).length, [contactMessages]);

  const totalRevenue = useMemo(() =>
    bookings.reduce((s, b) => s + (parseInt((b.totalAmount || '0').replace(/,/g, '')) || 0), 0),
    [bookings]
  );

  const pendingBookings = useMemo(() => bookings.filter(b => b.status === 'PENDING'), [bookings]);
  const confirmedBookings = useMemo(() => bookings.filter(b => b.status === 'CONFIRMED'), [bookings]);
  const completedBookings = useMemo(() => bookings.filter(b => b.status === 'COMPLETED'), [bookings]);
  const cancelledBookings = useMemo(() => bookings.filter(b => b.status === 'CANCELLED'), [bookings]);

  const bookingsWithPayments = useMemo(() => bookings.filter(b => b.payment), [bookings]);
  const paymentsCompleted = useMemo(() => bookingsWithPayments.filter(b => b.payment?.status === 'COMPLETED' || b.payment?.status === 'PAID'), [bookingsWithPayments]);
  const paymentsPending = useMemo(() => bookingsWithPayments.filter(b => b.payment?.status === 'PENDING'), [bookingsWithPayments]);

  const revenueByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    bookings.forEach(b => {
      const cat = b.event?.category || 'other';
      map[cat] = (map[cat] || 0) + (parseInt((b.totalAmount || '0').replace(/,/g, '')) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [bookings]);

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchSearch = !searchQuery || ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || ev.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'all' || ev.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [events, searchQuery, categoryFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, bookingsRes, staffRes, msgsRes] = await Promise.all([
        fetch('/api/events').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
        fetch('/api/staff').then(r => r.json()),
        fetch('/api/contact').then(r => r.json()),
      ]);
      if (eventsRes.success) setEvents(eventsRes.events);
      if (bookingsRes.success) setBookings(bookingsRes.bookings);
      if (staffRes.success) {
        setStaffAssignments(staffRes.assignments);
        if (staffRes.staffMembers) {
          setStaffList(staffRes.staffMembers);
          setAllStaff(staffRes.staffMembers);
        } else {
          const uniqueStaff = staffRes.assignments
            .filter((a: any) => a.staff)
            .reduce((acc: any[], a: any) => {
              if (!acc.find((s: any) => s.id === a.staff.id)) acc.push(a.staff);
              return acc;
            }, []);
          setStaffList(uniqueStaff);
          setAllStaff(uniqueStaff);
        }
      }
      if (msgsRes.success) setContactMessages(msgsRes.messages);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [eventsRes, bookingsRes, staffRes, msgsRes] = await Promise.all([
          fetch('/api/events').then(r => r.json()),
          fetch('/api/bookings').then(r => r.json()),
          fetch('/api/staff').then(r => r.json()),
          fetch('/api/contact').then(r => r.json()),
        ]);
        if (cancelled) return;
        if (eventsRes.success) setEvents(eventsRes.events);
        if (bookingsRes.success) setBookings(bookingsRes.bookings);
        if (staffRes.success) {
          setStaffAssignments(staffRes.assignments);
          if (staffRes.staffMembers) {
            setStaffList(staffRes.staffMembers);
            setAllStaff(staffRes.staffMembers);
          } else {
            const uniqueStaff = staffRes.assignments
              .filter((a: any) => a.staff)
              .reduce((acc: any[], a: any) => {
                if (!acc.find((s: any) => s.id === a.staff.id)) acc.push(a.staff);
                return acc;
              }, []);
            setStaffList(uniqueStaff);
            setAllStaff(uniqueStaff);
          }
        }
        if (msgsRes.success) setContactMessages(msgsRes.messages);
      } catch { /* silent */ }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [currentUser]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...eventForm, slug: eventForm.slug || eventForm.title.toLowerCase().replace(/\s+/g, '-'), features: [], ideas: [], gallery: [] }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Event created successfully');
        setEventDialogOpen(false);
        setEventForm({ title: '', slug: '', description: '', shortDesc: '', category: 'wedding', priceRange: '', duration: '', capacity: '', image: '', isFeatured: false });
        fetchData();
      } else toast.error(data.message || 'Failed to create event');
    } catch { toast.error('Failed to create event'); }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingEvent.id, ...eventForm }),
      });
      const data = await res.json();
      if (data.success) { toast.success('Event updated successfully'); setEventDialogOpen(false); setEditingEvent(null); fetchData(); }
    } catch { toast.error('Failed to update event'); }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { toast.success('Event deleted successfully'); fetchData(); }
    } catch { toast.error('Failed to delete event'); }
  };

  const handleUpdateBooking = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/bookings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
      const data = await res.json();
      if (data.success) { toast.success(`Booking ${status.toLowerCase()}`); fetchData(); }
    } catch { toast.error('Failed to update booking'); }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(assignForm) });
      const data = await res.json();
      if (data.success) { toast.success('Assignment created successfully'); setAssignmentDialogOpen(false); setAssignForm({ eventId: '', staffId: '', role: 'Coordinator', notes: '' }); fetchData(); }
    } catch { toast.error('Failed to create assignment'); }
  };

  const handleMarkMessageRead = async (id: string, isRead: boolean) => {
    try {
      await fetch('/api/contact', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isRead: !isRead }) });
      setContactMessages(contactMessages.map(m => m.id === id ? { ...m, isRead: !isRead } : m));
    } catch { /* silent */ }
  };

  const openEditEvent = (ev: any) => {
    setEditingEvent(ev);
    setEventForm({
      title: ev.title, slug: ev.slug, description: ev.description, shortDesc: ev.shortDesc || '',
      category: ev.category, priceRange: ev.priceRange || '', duration: ev.duration || '',
      capacity: ev.capacity || '', image: ev.image || '', isFeatured: ev.isFeatured,
    });
    setEventDialogOpen(true);
  };

  const openCreateEvent = () => {
    setEditingEvent(null);
    setEventForm({ title: '', slug: '', description: '', shortDesc: '', category: 'wedding', priceRange: '', duration: '', capacity: '', image: '', isFeatured: false });
    setEventDialogOpen(true);
  };

  // ─── SIDEBAR ─────────────────────────────────────────────
  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
            <img src="/events/logo.png" alt="EventPro" className="h-7 w-7 rounded-lg" />
          </div>
          <div>
            <span className="text-lg font-bold gold-gradient block leading-tight">EventPro</span>
            <span className="text-[11px] text-sidebar-foreground/40 font-medium tracking-wider uppercase">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/30 px-3 mb-3">Menu</p>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = adminTab === item.key;
          const badgeCount = item.badge === 'messages' ? unreadMessages : 0;
          return (
            <button
              key={item.key}
              onClick={() => { setAdminTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-sidebar-primary/90 to-sidebar-primary/70 text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {badgeCount > 0 && (
                <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {badgeCount}
                </span>
              )}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-l-full bg-sidebar-primary-foreground/40" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-sidebar-accent/50">
          <Avatar className="h-9 w-9 ring-2 ring-sidebar-primary/30">
            <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary text-sm font-bold">
              {currentUser?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{currentUser?.name || 'Admin'}</p>
            <p className="text-[11px] text-sidebar-foreground/40 truncate">{currentUser?.email || ''}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage('landing')} className="p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors" title="Back to Home">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button onClick={logout} className="p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── MOBILE HEADER ───────────────────────────────────────
  const renderMobileHeader = () => (
    <div className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {renderSidebar()}
        </SheetContent>
      </Sheet>
      <span className="font-bold gold-gradient text-lg">EventPro Admin</span>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {unreadMessages}
            </span>
          )}
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
            {currentUser?.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );

  // ─── DASHBOARD TAB ───────────────────────────────────────
  const renderDashboard = () => (
    <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        variants={stagger.item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-6 sm:p-8 text-white"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-500 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-amber-400 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-amber-300/80 text-sm font-medium mb-1">Welcome back,</p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{currentUser?.name || 'Admin'} 👋</h1>
            <p className="text-neutral-400 text-sm max-w-md">
              Here&apos;s what&apos;s happening with your event management platform today.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-xl font-bold text-amber-300">{events.length}</p>
              <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Events</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-xl font-bold text-emerald-300">{bookings.length}</p>
              <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Bookings</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <p className="text-xl font-bold text-blue-300">{staffList.length}</p>
              <p className="text-[11px] text-neutral-400 uppercase tracking-wide">Staff</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={stagger.item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: events.length, icon: CalendarDays, trend: '+12%', trendUp: true, borderColor: 'border-l-amber-400', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' },
          { label: 'Total Bookings', value: bookings.length, icon: CalendarCheck, trend: '+8%', trendUp: true, borderColor: 'border-l-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+23%', trendUp: true, borderColor: 'border-l-green-400', iconBg: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600 dark:text-green-400' },
          { label: 'Active Staff', value: staffList.length, icon: Users, trend: '+2', trendUp: true, borderColor: 'border-l-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={stagger.item} className={`relative bg-card rounded-xl border border-border border-l-4 ${stat.borderColor} p-5 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 group`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                  {stat.trendUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {stat.trend}
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Revenue + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Revenue Overview */}
        <motion.div variants={stagger.item} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Revenue by Category
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {revenueByCategory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <PieChart className="h-10 w-10 mb-2 opacity-30" />
                  <p className="text-sm">No revenue data yet</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {revenueByCategory.slice(0, 6).map(([cat, amount]) => {
                    const maxAmount = revenueByCategory[0]?.[1] || 1;
                    const pct = Math.round((amount / maxAmount) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="font-medium capitalize">{cat}</span>
                          <span className="text-muted-foreground font-semibold">₹{amount.toLocaleString()}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className={`h-full rounded-full ${
                              cat === 'wedding' ? 'bg-gradient-to-r from-pink-400 to-rose-400' :
                              cat === 'corporate' ? 'bg-gradient-to-r from-slate-400 to-gray-500' :
                              cat === 'birthday' ? 'bg-gradient-to-r from-purple-400 to-violet-400' :
                              cat === 'party' ? 'bg-gradient-to-r from-orange-400 to-amber-400' :
                              cat === 'conference' ? 'bg-gradient-to-r from-blue-400 to-indigo-400' :
                              'bg-gradient-to-r from-amber-400 to-yellow-400'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Bookings Table */}
        <motion.div variants={stagger.item} className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Recent Bookings
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setAdminTab('manage-bookings')}>
                  View All <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs">Event</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.slice(0, 5).map(b => (
                      <TableRow key={b.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                {b.user?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{b.user?.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{b.event?.title || b.eventType}</TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                          {b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[b.status] || ''} text-[10px] font-semibold border`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusDotColors[b.status] || ''}`} />
                            {b.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {bookings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No bookings yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pending Approvals + Recent Events Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <motion.div variants={stagger.item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Pending Approvals
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{pendingBookings.length} pending</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingBookings.length === 0 ? (
                  <div className="flex flex-col items-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 mb-2 opacity-30" />
                    <p className="text-sm">All caught up! No pending approvals.</p>
                  </div>
                ) : (
                  pendingBookings.slice(0, 4).map(b => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-all group">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        {b.event?.image ? (
                          <img src={b.event.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{b.user?.name || 'Client'}</p>
                        <p className="text-xs text-muted-foreground truncate">{b.event?.title || b.eventType}</p>
                        <p className="text-[11px] text-muted-foreground">{b.eventDate || 'No date'}</p>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => handleUpdateBooking(b.id, 'CONFIRMED')} title="Approve">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => handleUpdateBooking(b.id, 'CANCELLED')} title="Reject">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Events Gallery */}
        <motion.div variants={stagger.item}>
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Featured Events
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => setAdminTab('manage-events')}>
                  View All <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {events.filter(e => e.isFeatured).slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    className="group relative rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => { setSelectedEvent(ev); setCurrentPage('event-detail'); }}
                  >
                    <div className="aspect-[4/3] bg-muted">
                      {ev.image ? (
                        <img src={ev.image} alt={ev.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-xs font-semibold truncate">{ev.title}</p>
                      <p className="text-white/70 text-[10px] capitalize">{ev.category}</p>
                    </div>
                  </div>
                ))}
                {events.filter(e => e.isFeatured).length === 0 && (
                  <div className="col-span-3 text-center py-6 text-muted-foreground text-sm">No featured events</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );

  // ─── MANAGE EVENTS TAB ───────────────────────────────────
  const renderManageEvents = () => {
    const emptyForm = { title: '', slug: '', description: '', shortDesc: '', category: 'wedding', priceRange: '', duration: '', capacity: '', image: '', isFeatured: false };

    return (
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
        {/* Header */}
        <motion.div variants={stagger.item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Events</h1>
            <p className="text-muted-foreground text-sm mt-1">Create, edit, and manage all your events</p>
          </div>
          <Dialog open={eventDialogOpen} onOpenChange={(open) => { setEventDialogOpen(open); if (!open) setEditingEvent(null); }}>
            <DialogTrigger asChild>
              <Button className="gold-gradient-bg text-white font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-shadow" onClick={openCreateEvent}>
                <Plus className="h-4 w-4 mr-2" /> Add New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle className="text-lg font-semibold">{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle></DialogHeader>
              <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Title *</Label>
                  <Input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required placeholder="Event name" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Slug</Label>
                  <Input value={eventForm.slug} onChange={(e) => setEventForm({ ...eventForm, slug: e.target.value })} placeholder="auto-generated-if-empty" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Short Description</Label>
                  <Input value={eventForm.shortDesc} onChange={(e) => setEventForm({ ...eventForm, shortDesc: e.target.value })} placeholder="Brief description" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={eventForm.category} onValueChange={(v) => setEventForm({ ...eventForm, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {eventCategories.map(c => (
                        <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Price Range</Label>
                    <Input value={eventForm.priceRange} onChange={(e) => setEventForm({ ...eventForm, priceRange: e.target.value })} placeholder="e.g. ₹50,000-₹2,00,000" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Duration</Label>
                    <Input value={eventForm.duration} onChange={(e) => setEventForm({ ...eventForm, duration: e.target.value })} placeholder="e.g. 4-6 hours" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Capacity</Label>
                  <Input value={eventForm.capacity} onChange={(e) => setEventForm({ ...eventForm, capacity: e.target.value })} placeholder="e.g. 100-500 guests" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea rows={4} value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="Detailed description..." />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Image URL</Label>
                  <Input value={eventForm.image} onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })} placeholder="/events/your-image.jpg" />
                  {eventForm.image && (
                    <div className="mt-2 h-32 rounded-xl overflow-hidden bg-muted">
                      <img src={eventForm.image} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full gold-gradient-bg text-white font-semibold shadow-lg shadow-amber-500/20">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div variants={stagger.item} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {eventCategories.map(c => (
                  <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex rounded-lg border border-input overflow-hidden">
              <button
                onClick={() => setEventsViewMode('grid')}
                className={`px-3 py-2 transition-colors ${eventsViewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setEventsViewMode('table')}
                className={`px-3 py-2 transition-colors ${eventsViewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Grid View */}
        {eventsViewMode === 'grid' && (
          <motion.div variants={stagger.container} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEvents.map(ev => (
              <motion.div key={ev.id} variants={stagger.item} className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
                <div className="relative h-40 overflow-hidden">
                  {ev.image ? (
                    <img src={ev.image} alt={ev.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className={`${categoryColors[ev.category] || 'bg-gray-100 text-gray-700'} text-[10px] font-semibold border-0 backdrop-blur-sm`}>
                      {ev.category}
                    </Badge>
                    {ev.isFeatured && (
                      <Badge className="bg-amber-400 text-amber-900 text-[10px] font-semibold border-0 flex items-center gap-1">
                        <Star className="h-2.5 w-2.5 fill-current" /> Featured
                      </Badge>
                    )}
                  </div>
                  {/* Hover Actions */}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm" onClick={() => openEditEvent(ev)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-red-50 hover:text-red-600 shadow-lg backdrop-blur-sm" onClick={() => handleDeleteEvent(ev.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-1">{ev.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    {ev.priceRange && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {ev.priceRange}</span>}
                    {ev.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {ev.duration}</span>}
                    {ev.capacity && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {ev.capacity}</span>}
                  </div>
                  <Badge className={`${statusColors[ev.status] || ''} text-[10px] font-semibold border`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusDotColors[ev.status] || ''}`} />
                    {ev.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
            {filteredEvents.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No events found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Table View */}
        {eventsViewMode === 'table' && (
          <motion.div variants={stagger.item}>
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Event</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Category</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Price</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map(ev => (
                      <TableRow key={ev.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              {ev.image ? <img src={ev.image} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center"><ImageIcon className="h-3 w-3 text-muted-foreground" /></div>}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{ev.title}</p>
                              {ev.isFeatured && <span className="text-[10px] text-amber-600 flex items-center gap-0.5"><Star className="h-2.5 w-2.5 fill-current" /> Featured</span>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant="secondary" className="text-[11px]">{ev.category}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{ev.priceRange || '-'}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge className={`${statusColors[ev.status] || ''} text-[10px] font-semibold border`}>{ev.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEditEvent(ev)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600" onClick={() => handleDeleteEvent(ev.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // ─── MANAGE BOOKINGS TAB ─────────────────────────────────
  const renderManageBookings = () => (
    <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={stagger.item}>
        <h1 className="text-2xl font-bold">Manage Bookings</h1>
        <p className="text-muted-foreground text-sm mt-1">View and manage all booking requests</p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={stagger.item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: bookings.length, icon: CalendarCheck, color: 'bg-slate-100 dark:bg-slate-900/30', iconColor: 'text-slate-600 dark:text-slate-400' },
          { label: 'Pending', value: pendingBookings.length, icon: Clock, color: 'bg-yellow-100 dark:bg-yellow-900/30', iconColor: 'text-yellow-600 dark:text-yellow-400' },
          { label: 'Confirmed', value: confirmedBookings.length, icon: CheckCircle2, color: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Completed', value: completedBookings.length, icon: Package, color: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* View Toggle */}
      <motion.div variants={stagger.item} className="flex justify-end">
        <div className="flex rounded-lg border border-input overflow-hidden">
          <button
            onClick={() => setBookingsViewMode('cards')}
            className={`px-3 py-2 transition-colors ${bookingsViewMode === 'cards' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setBookingsViewMode('table')}
            className={`px-3 py-2 transition-colors ${bookingsViewMode === 'table' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Cards View */}
      {bookingsViewMode === 'cards' && (
        <motion.div variants={stagger.container} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map(b => (
            <motion.div key={b.id} variants={stagger.item} className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {b.user?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm">{b.user?.name || 'Unknown Client'}</h3>
                    <Badge className={`${statusColors[b.status] || ''} text-[10px] font-semibold border`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1 ${statusDotColors[b.status] || ''}`} />
                      {b.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{b.user?.email}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      {b.event?.image ? (
                        <img src={b.event.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{b.event?.title || b.eventType}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {b.eventDate && <span>{new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                        {b.guestCount && <span>• {b.guestCount} guests</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {b.budget && <span>Budget: ₹{b.budget}</span>}
                      {b.totalAmount && <span className="ml-3 font-semibold text-foreground">₹{b.totalAmount}</span>}
                    </div>
                    <Select value={b.status} onValueChange={(v) => handleUpdateBooking(b.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {bookings.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <CalendarCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No bookings found</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Table View */}
      {bookingsViewMode === 'table' && (
        <motion.div variants={stagger.item}>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Client</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Event</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Date</TableHead>
                    <TableHead className="text-xs hidden md:table-cell">Budget</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">{b.user?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{b.user?.name}</div>
                            <div className="text-xs text-muted-foreground">{b.user?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{b.event?.title || b.eventType}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm">{b.eventDate || '-'}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{b.budget ? `₹${b.budget}` : '-'}</TableCell>
                      <TableCell><Badge className={`${statusColors[b.status] || ''} text-[10px] font-semibold border`}>{b.status}</Badge></TableCell>
                      <TableCell>
                        <Select value={b.status} onValueChange={(v) => handleUpdateBooking(b.id, v)}>
                          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bookings.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">No bookings found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );

  // ─── MANAGE STAFF TAB ────────────────────────────────────
  const renderManageStaff = () => (
    <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={stagger.item}>
        <h1 className="text-2xl font-bold">Manage Staff</h1>
        <p className="text-muted-foreground text-sm mt-1">View staff members and their assignment details</p>
      </motion.div>

      <motion.div variants={stagger.container} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {staffList.map(s => {
          const assignments = staffAssignments.filter(a => a.staffId === s.id);
          const completedAssignments = assignments.filter(a => a.status === 'COMPLETED').length;
          const completionRate = assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 0;
          const recentAssignments = assignments.slice(0, 3);
          const borderColors = assignments.length >= 5 ? 'ring-purple-400' : assignments.length >= 3 ? 'ring-amber-400' : 'ring-emerald-400';

          return (
            <motion.div key={s.id} variants={stagger.item} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
              <div className="p-6">
                <div className="flex flex-col items-center text-center mb-5">
                  <Avatar className={`h-20 w-20 ring-4 ${borderColors} mb-3`}>
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                      {s.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-base">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">{s.email}</p>
                  {s.phone && (
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {s.phone}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-lg font-bold">{assignments.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Assignments</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-muted/50">
                    <p className="text-lg font-bold text-emerald-600">{completionRate}%</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Completion</p>
                  </div>
                </div>

                {recentAssignments.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Recent Assignments</p>
                    <div className="space-y-2">
                      {recentAssignments.map(a => (
                        <div key={a.id} className="flex items-center gap-2 text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDotColors[a.status] || 'bg-gray-400'}`} />
                          <span className="truncate flex-1">{a.event?.title || 'Unknown Event'}</span>
                          <Badge className={`${statusColors[a.status] || ''} text-[9px] font-semibold border`}>{a.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
        {staffList.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No staff members found</p>
            <p className="text-sm mt-1">Create staff assignments to see them here</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  // ─── STAFF ASSIGNMENTS TAB ───────────────────────────────
  const renderStaffAssignments = () => (
    <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={stagger.item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Staff Assignments</h1>
          <p className="text-muted-foreground text-sm mt-1">Assign staff to events and manage roles</p>
        </div>
        <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gold-gradient-bg text-white font-semibold shadow-lg shadow-amber-500/20">
              <Plus className="h-4 w-4 mr-2" /> New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-lg font-semibold">Create Assignment</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Event</Label>
                <Select value={assignForm.eventId} onValueChange={(v) => setAssignForm({ ...assignForm, eventId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
                  <SelectContent>{events.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Staff</Label>
                <Select value={assignForm.staffId} onValueChange={(v) => setAssignForm({ ...assignForm, staffId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>{staffList.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Role</Label>
                <Input value={assignForm.role} onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value })} placeholder="e.g., Coordinator" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Notes</Label>
                <Textarea rows={3} value={assignForm.notes} onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })} />
              </div>
              <Button type="submit" className="w-full gold-gradient-bg text-white font-semibold shadow-lg shadow-amber-500/20">Create Assignment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div variants={stagger.container} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffAssignments.map(a => (
          <motion.div key={a.id} variants={stagger.item} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
            <div className="flex gap-3 p-4">
              <div className="h-16 w-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {a.event?.image ? (
                  <img src={a.event.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm truncate">{a.event?.title || 'Unknown'}</p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {a.staff?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{a.staff?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {a.role && <Badge variant="secondary" className="text-[10px]">{a.role}</Badge>}
                  <Badge className={`${statusColors[a.status] || ''} text-[10px] font-semibold border`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 ${statusDotColors[a.status] || ''}`} />
                    {a.status}
                  </Badge>
                </div>
              </div>
            </div>
            {a.notes && (
              <div className="px-4 pb-4">
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5 line-clamp-2">{a.notes}</p>
              </div>
            )}
          </motion.div>
        ))}
        {staffAssignments.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No assignments found</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  // ─── PAYMENTS TAB ────────────────────────────────────────
  const renderPayments = () => {
    const totalPaid = paymentsCompleted.reduce((s, b) => s + (parseInt((b.payment?.amount || '0').replace(/,/g, '')) || 0), 0);
    const totalPending = paymentsPending.reduce((s, b) => s + (parseInt((b.payment?.amount || '0').replace(/,/g, '')) || 0), 0);

    return (
      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={stagger.item}>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage all payment transactions</p>
        </motion.div>

        {/* Payment Stats */}
        <motion.div variants={stagger.item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Revenue', value: `₹${totalPaid.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400', borderColor: 'border-l-emerald-400' },
            { label: 'Pending Payments', value: `₹${totalPending.toLocaleString()}`, icon: Clock, color: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400', borderColor: 'border-l-amber-400' },
            { label: 'Transactions', value: bookingsWithPayments.length, icon: CreditCard, color: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400', borderColor: 'border-l-blue-400' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className={`bg-card rounded-xl border border-border border-l-4 ${s.borderColor} p-5`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${s.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Payment Cards */}
        <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-3">
          {bookingsWithPayments.map(b => (
            <motion.div key={b.id} variants={stagger.item} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-900/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{b.event?.title || 'Booking'}</p>
                    <p className="text-xs text-muted-foreground">{b.user?.name} • {b.payment?.method || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                  <div className="text-right">
                    <p className="font-bold text-base">₹{b.payment?.amount || '0'}</p>
                    {b.payment?.transactionId && (
                      <p className="text-[10px] text-muted-foreground font-mono">TXN: {b.payment.transactionId}</p>
                    )}
                  </div>
                  <Badge className={`${statusColors[b.payment?.status || ''] || ''} text-[10px] font-semibold border`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusDotColors[b.payment?.status || ''] || ''}`} />
                    {b.payment?.status}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
          {bookingsWithPayments.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No payments found</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  // ─── MESSAGES TAB ────────────────────────────────────────
  const renderMessages = () => (
    <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6">
      <motion.div variants={stagger.item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">Client inquiries and contact messages</p>
        </div>
        {unreadMessages > 0 && (
          <Badge className="bg-red-500 text-white text-xs font-semibold px-3 py-1">
            {unreadMessages} unread
          </Badge>
        )}
      </motion.div>

      <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-3">
        {contactMessages.map(m => (
          <motion.div
            key={m.id}
            variants={stagger.item}
            className={`bg-card rounded-xl border p-5 hover:shadow-md transition-all duration-200 ${
              !m.isRead ? 'border-primary/20 bg-primary/[0.02] shadow-sm shadow-primary/5' : 'border-border'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <Avatar className="h-11 w-11">
                  <AvatarFallback className={`font-bold text-sm ${!m.isRead ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {m.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {!m.isRead && (
                  <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary ring-2 ring-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`text-sm ${!m.isRead ? 'font-semibold' : 'font-medium'}`}>{m.subject}</h3>
                  {!m.isRead && <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0">NEW</Badge>}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{m.name}</span>
                  <span>•</span>
                  <span className="truncate">{m.email}</span>
                  <span>•</span>
                  <span>{new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{m.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs flex-shrink-0 ${m.isRead ? 'text-muted-foreground hover:text-amber-600' : 'text-primary hover:text-primary/80'}`}
                onClick={() => handleMarkMessageRead(m.id, m.isRead)}
              >
                {m.isRead ? (
                  <><Mail className="h-3.5 w-3.5 mr-1" /> Mark Unread</>
                ) : (
                  <><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark Read</>
                )}
              </Button>
            </div>
          </motion.div>
        ))}
        {contactMessages.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No messages</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  // ─── PROFILE TAB ─────────────────────────────────────────
  const renderProfile = () => (
    <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-6 max-w-3xl">
      <motion.div variants={stagger.item}>
        <h1 className="text-2xl font-bold">Admin Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Your account overview and statistics</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={stagger.item} className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-500 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-30 h-30 rounded-full bg-amber-400 blur-3xl" />
          </div>
        </div>
        <div className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6">
            <Avatar className="h-24 w-24 ring-4 ring-card">
              <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                {currentUser?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">{currentUser?.name || 'Admin'}</h2>
              <p className="text-sm text-muted-foreground">{currentUser?.email || ''}</p>
              <Badge className="mt-1.5 gold-gradient-bg text-white border-0 text-[10px] font-semibold uppercase tracking-wide">Administrator</Badge>
            </div>
          </div>
          <Separator className="mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{currentUser?.email || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{currentUser?.phone || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={stagger.item} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Events Managed', value: events.length, icon: CalendarDays, color: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600 dark:text-amber-400' },
          { label: 'Bookings Processed', value: bookings.length, icon: CalendarCheck, color: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Staff Members', value: staffList.length, icon: Users, color: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' },
          { label: 'Messages', value: contactMessages.length, icon: MessageSquare, color: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-card rounded-xl border border-border p-4 text-center">
              <div className={`h-10 w-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );

  // ─── LOADING ─────────────────────────────────────────────
  const renderLoading = () => (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );

  // ─── CONTENT ROUTER ──────────────────────────────────────
  const renderContent = () => {
    if (loading) return renderLoading();
    switch (adminTab) {
      case 'dashboard': return renderDashboard();
      case 'manage-events': return renderManageEvents();
      case 'manage-bookings': return renderManageBookings();
      case 'manage-staff': return renderManageStaff();
      case 'staff-assignments': return renderStaffAssignments();
      case 'payments': return renderPayments();
      case 'messages': return renderMessages();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  // ─── MAIN RENDER ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0 h-screen sticky top-0">
        {renderSidebar()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {renderMobileHeader()}

        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={adminTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
