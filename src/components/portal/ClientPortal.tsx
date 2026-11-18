'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Search, CalendarCheck, Users, User, LogOut, Bell, X, Menu, ChevronRight, ArrowLeft, Image as ImageIcon,
  Filter, Star, Clock, DollarSign, MapPin, Heart, Send, Calendar, Eye, MessageSquare,
  TrendingUp, Sparkles, ArrowRight, Package, CheckCircle2, AlertCircle, Mail, Phone
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
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { useAppStore, type BookingItem, type EventItem, type PortalTab } from '@/store/useAppStore';
import { toast } from 'sonner';

// ─── Constants ──────────────────────────────────────────────────────────────────

const sidebarItems = [
  { key: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { key: 'browse-events' as const, label: 'Browse Events', icon: Search },
  { key: 'my-bookings' as const, label: 'My Bookings', icon: CalendarCheck },
  { key: 'contact-staff' as const, label: 'Contact Staff', icon: Users },
  { key: 'profile' as const, label: 'My Profile', icon: User },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
};

const statusIconMap: Record<string, typeof Clock> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  CANCELLED: X,
  COMPLETED: CheckCircle2,
};

const eventCategories = [
  'All', 'Wedding', 'Corporate', 'Birthday', 'Webinar', 'Party',
  'Conference', 'Baby Shower', 'Anniversary', 'Cultural', 'Product Launch', 'Graduation',
];

const motivationalMessages = [
  'Your next unforgettable event is just a click away!',
  'Let\'s create memories that last a lifetime.',
  'Discover extraordinary experiences crafted for you.',
  'Turn your vision into a spectacular celebration.',
  'Every great event starts with a single booking.',
];

// ─── Animation Variants ────────────────────────────────────────────────────────

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const cardHover = {
  rest: { y: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  hover: { y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' },
};

// ─── Stat Card Component ───────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, delay = 0 }: {
  label: string; value: string | number; icon: typeof TrendingUp; color: string; delay?: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      <Card className="overflow-hidden border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-stretch">
            <div className={`w-1.5 rounded-l-lg ${color}`} />
            <div className="flex items-center justify-between flex-1 p-5">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{label}</p>
                <motion.p
                  className="text-2xl font-bold mt-1 tracking-tight"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
                >
                  {value}
                </motion.p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('bg-', 'bg-').replace('-500', '-50')}`}>
                <Icon className="h-5 w-5" style={{ color: 'var(--chart-1)' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function ClientPortal() {
  const store = useAppStore();
  const {
    currentUser, clientTab, setClientTab, setCurrentPage, logout,
    events, setEvents, bookings, setBookings, notifications, setNotifications,
    setSelectedEvent, setStaffAssignments,
  } = store;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [bookingFilter, setBookingFilter] = useState('All');
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [staffList, setStaffList] = useState<any[]>([]);
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', bio: '' });
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  // Booking dialog state
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingEvent, setBookingEvent] = useState<EventItem | null>(null);
  const [bookingForm, setBookingForm] = useState({ eventDate: '', guestCount: '', budget: '', message: '' });
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // ─── Data Fetching ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!currentUser) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, bookingsRes, notifsRes, staffRes] = await Promise.all([
          fetch('/api/events').then(r => r.json()),
          fetch(`/api/bookings?userId=${currentUser.id}`).then(r => r.json()),
          fetch(`/api/notifications?userId=${currentUser.id}`).then(r => r.json()),
          fetch('/api/staff').then(r => r.json()),
        ]);
        if (eventsRes.success) setEvents(eventsRes.events);
        if (bookingsRes.success) setBookings(bookingsRes.bookings);
        if (notifsRes.success) setNotifications(notifsRes.notifications);
        if (staffRes.success) {
          const uniqueStaff = staffRes.assignments
            .filter((a: any) => a.staff)
            .reduce((acc: any[], a: any) => {
              if (!acc.find((s: any) => s.id === a.staff.id)) acc.push(a.staff);
              return acc;
            }, []);
          setStaffList(uniqueStaff);
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  // ─── Derived Data ──────────────────────────────────────────────────────────

  const filteredEvents = useMemo(() => events.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.shortDesc || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = filterCategory === 'All' || e.category.toLowerCase() === filterCategory.toLowerCase();
    return matchSearch && matchCategory;
  }), [events, searchTerm, filterCategory]);

  const featuredEvents = useMemo(() => events.filter(e => e.isFeatured).slice(0, 4), [events]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'All') return bookings;
    return bookings.filter(b => b.status === bookingFilter);
  }, [bookings, bookingFilter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const totalSpent = bookings
    .filter(b => b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + (parseFloat(b.totalAmount || b.budget || '0')), 0);
  const motivationalMsg = motivationalMessages[Math.floor(Date.now() / 86400000) % motivationalMessages.length];

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleViewEvent = (event: any) => {
    setSelectedEvent(event);
    setCurrentPage('event-detail');
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Booking cancelled successfully');
        const updated = bookings.map((b: BookingItem) => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b);
        setBookings(updated);
      }
    } catch { toast.error('Failed to cancel booking'); }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      }
    } catch { toast.error('Failed to send message. Please try again.'); }
  };

  const markNotificationRead = async (id: string) => {
    setMarkingRead(id);
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* silent */ }
    setMarkingRead(null);
  };

  const openBookingDialog = (event: EventItem) => {
    setBookingEvent(event);
    setBookingForm({ eventDate: '', guestCount: '', budget: '', message: '' });
    setBookingDialogOpen(true);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !bookingEvent) return;
    if (!bookingForm.eventDate) {
      toast.error('Please select an event date');
      return;
    }
    setSubmittingBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          eventId: bookingEvent.id,
          eventType: bookingEvent.category,
          eventDate: bookingForm.eventDate,
          guestCount: bookingForm.guestCount,
          budget: bookingForm.budget,
          message: bookingForm.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Booking submitted! We\'ll confirm your reservation shortly.');
        setBookingDialogOpen(false);
        // Refresh bookings
        const bookingsRes = await fetch(`/api/bookings?userId=${currentUser.id}`).then(r => r.json());
        if (bookingsRes.success) setBookings(bookingsRes.bookings);
      } else {
        toast.error(data.message || 'Failed to create booking');
      }
    } catch { toast.error('Failed to create booking. Please try again.'); }
    setSubmittingBooking(false);
  };

  // ─── Sidebar ───────────────────────────────────────────────────────────────

  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-sidebar via-sidebar to-sidebar">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <img src="/events/logo.png" alt="EventPro" className="h-8 w-8 rounded-full ring-2 ring-sidebar-primary/30" />
          <span className="text-lg font-bold gold-gradient">EventPro</span>
        </div>
      </div>

      {/* User Banner */}
      <div className="mx-3 mt-4 mb-2 rounded-xl p-4 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/20">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-amber-500/40">
            <AvatarFallback className="bg-amber-500/20 text-amber-400 font-semibold text-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">{currentUser?.name}</p>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] mt-0.5">
              {currentUser?.role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = clientTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { setClientTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full gold-gradient-bg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-amber-400' : ''}`} />
              <span>{item.label}</span>
              {item.key === 'dashboard' && unreadCount > 0 && (
                <Badge className="ml-auto bg-red-500 text-white text-[10px] h-5 min-w-5 flex items-center justify-center px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => setCurrentPage('landing')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Home
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout
        </button>
      </div>
    </div>
  );

  // ─── Dashboard Tab ─────────────────────────────────────────────────────────

  const renderDashboard = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl gold-gradient-bg p-8 text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-white/80" />
            <p className="text-sm text-white/80 font-medium">Welcome back to EventPro</p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Hello, {currentUser?.name?.split(' ')[0]}! 🎉
          </h1>
          <p className="text-white/80 text-lg max-w-xl mb-6">{motivationalMsg}</p>
          <Button
            onClick={() => setClientTab('browse-events')}
            className="bg-white text-amber-700 hover:bg-white/90 font-semibold shadow-lg shadow-black/10"
          >
            Browse Events <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Upcoming Events"
          value={bookings.filter(b => b.status === 'CONFIRMED').length}
          icon={CalendarCheck}
          color="bg-emerald-500"
          delay={0}
        />
        <StatCard
          label="Total Bookings"
          value={bookings.length}
          icon={Package}
          color="bg-amber-500"
          delay={0.05}
        />
        <StatCard
          label="Notifications"
          value={unreadCount}
          icon={Bell}
          color="bg-red-500"
          delay={0.1}
        />
        <StatCard
          label="Amount Spent"
          value={`$${totalSpent.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
          delay={0.15}
        />
      </div>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" /> Featured Events
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Handpicked events just for you</p>
            </div>
            <Button variant="ghost" onClick={() => setClientTab('browse-events')} className="text-sm">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredEvents.map((event, i) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                onClick={() => handleViewEvent(event)}
              >
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={event.image || '/events/hero.jpg'}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 text-xs shadow-sm">
                      {event.category}
                    </Badge>
                    {event.priceRange && (
                      <Badge className="absolute top-3 right-3 bg-black/50 text-white border-0 text-xs backdrop-blur-sm">
                        {event.priceRange}
                      </Badge>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-semibold text-sm line-clamp-1 drop-shadow-md">{event.title}</h3>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {event.shortDesc || event.description?.slice(0, 100)}
                    </p>
                    <Button
                      onClick={(e) => { e.stopPropagation(); openBookingDialog(event); }}
                      className="w-full gold-gradient-bg text-white border-0 hover:opacity-90 text-sm font-medium"
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity Timeline */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CalendarCheck className="h-4.5 w-4.5 text-amber-500" /> Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CalendarCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No bookings yet</p>
                <Button variant="link" className="text-amber-600 mt-1" onClick={() => setClientTab('browse-events')}>
                  Browse Events
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {bookings.slice(0, 5).map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <CalendarCheck className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{b.event?.title || b.eventType}</p>
                      <p className="text-xs text-muted-foreground">{b.eventDate || 'No date set'}</p>
                    </div>
                    <Badge className={`text-[10px] shrink-0 ${statusColors[b.status] || ''}`}>{b.status}</Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bell className="h-4.5 w-4.5 text-red-500" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {notifications.slice(0, 5).map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                      n.isRead ? 'bg-muted/30' : 'bg-amber-50 border border-amber-200/60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      n.isRead ? 'bg-muted' : 'bg-amber-100'
                    }`}>
                      <Bell className={`h-4 w-4 ${n.isRead ? 'text-muted-foreground' : 'text-amber-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs shrink-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => markNotificationRead(n.id)}
                        disabled={markingRead === n.id}
                      >
                        Mark Read
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // ─── Browse Events Tab ─────────────────────────────────────────────────────

  const renderBrowseEvents = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Hero Header */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-100/50 p-8"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-32 h-32 bg-orange-200/15 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1">
            Explore Our <span className="gold-gradient">Events</span>
          </h1>
          <p className="text-muted-foreground mb-5 max-w-lg">
            From intimate gatherings to grand celebrations, find the perfect event experience tailored to your vision.
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
            <Input
              placeholder="Search by event name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 bg-white border-amber-200/60 focus:border-amber-400 shadow-sm rounded-xl"
            />
          </div>
        </div>
      </motion.div>

      {/* Category Filter Pills */}
      <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {eventCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
              filterCategory === cat
                ? 'gold-gradient-bg text-white shadow-md shadow-amber-500/20'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Results Count */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Event Grid */}
      {filteredEvents.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No events found</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Try adjusting your search or filter to find what you&apos;re looking for.
          </p>
          <Button
            variant="outline"
            onClick={() => { setSearchTerm(''); setFilterCategory('All'); }}
            className="rounded-xl"
          >
            Clear Filters
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event, i) => (
            <motion.div
              key={event.id}
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              onClick={() => handleViewEvent(event)}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={event.image || '/events/hero.jpg'}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 text-xs font-medium shadow-sm">
                    {event.category}
                  </Badge>
                  {event.priceRange && (
                    <Badge className="absolute top-3 right-3 bg-white/90 text-foreground border-0 text-xs font-semibold backdrop-blur-sm shadow-sm">
                      {event.priceRange}
                    </Badge>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg leading-tight drop-shadow-md line-clamp-1">{event.title}</h3>
                  </div>
                  {event.isFeatured && (
                    <div className="absolute bottom-3 right-3">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400 drop-shadow-md" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-5 flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {event.shortDesc || event.description?.slice(0, 120)}
                  </p>

                  {/* Sample Gallery Previews */}
                  {(() => {
                    let galleryImgs: string[] = [];
                    try { galleryImgs = JSON.parse(event.gallery || '[]'); } catch {}
                    if (galleryImgs.length > 0) {
                      return (
                        <div className="mb-4">
                          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" /> Sample Decorations
                          </p>
                          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                            {galleryImgs.slice(0, 3).map((img, idx) => (
                              <img key={idx} src={img} alt="sample" className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-md border border-border shrink-0 hover:scale-110 transition-transform" />
                            ))}
                            {galleryImgs.length > 3 && (
                               <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-md bg-muted flex items-center justify-center shrink-0 border border-border">
                                  <span className="text-xs font-semibold text-muted-foreground">+{galleryImgs.length - 3}</span>
                               </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                    {event.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {event.duration}
                      </span>
                    )}
                    {event.capacity && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {event.capacity}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl text-sm"
                      onClick={() => handleViewEvent(event)}
                    >
                      <Eye className="h-4 w-4 mr-1.5" /> View Details
                    </Button>
                    <Button
                      className="flex-1 gold-gradient-bg text-white border-0 hover:opacity-90 rounded-xl text-sm font-medium shadow-sm shadow-amber-500/20"
                      onClick={(e) => { e.stopPropagation(); openBookingDialog(event); }}
                    >
                      Quick Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  // ─── Booking Dialog ────────────────────────────────────────────────────────

  const renderBookingDialog = () => (
    <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Event Image Header */}
        {bookingEvent && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={bookingEvent.image || '/events/hero.jpg'}
              alt={bookingEvent.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <Badge className="bg-amber-500 text-white border-0 text-xs mb-2">{bookingEvent.category}</Badge>
              <h2 className="text-white font-bold text-xl drop-shadow-md">{bookingEvent.title}</h2>
            </div>
          </div>
        )}

        <div className="px-6 pt-4 pb-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Book This Event</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in the details below to reserve this event. Your request and information will be sent directly to our Staff team for processing and they will reach out to you shortly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="booking-date">Event Date <span className="text-red-500">*</span></Label>
              <Input
                id="booking-date"
                type="date"
                value={bookingForm.eventDate}
                onChange={(e) => setBookingForm({ ...bookingForm, eventDate: e.target.value })}
                className="rounded-xl"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guest-count">Guest Count</Label>
                <Input
                  id="guest-count"
                  placeholder="e.g. 100"
                  value={bookingForm.guestCount}
                  onChange={(e) => setBookingForm({ ...bookingForm, guestCount: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Input
                  id="budget"
                  placeholder="e.g. $5,000"
                  value={bookingForm.budget}
                  onChange={(e) => setBookingForm({ ...bookingForm, budget: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="special-req">Special Requirements</Label>
              <Textarea
                id="special-req"
                placeholder="Tell us about any special requirements, decorations, themes..."
                value={bookingForm.message}
                onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBookingDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingBooking}
                className="rounded-xl gold-gradient-bg text-white border-0 hover:opacity-90 font-medium shadow-sm"
              >
                {submittingBooking ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Submit Booking
                  </span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );

  // ─── My Bookings Tab ───────────────────────────────────────────────────────

  const renderMyBookings = () => {
    const statusFilters = ['All', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold mb-1">My Bookings</h1>
          <p className="text-muted-foreground">View and manage all your event reservations.</p>
        </motion.div>

        {/* Status Filter */}
        <motion.div variants={itemVariants} className="flex gap-2 overflow-x-auto pb-1">
          {statusFilters.map(f => (
            <button
              key={f}
              onClick={() => setBookingFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                bookingFilter === f
                  ? 'gold-gradient-bg text-white shadow-md shadow-amber-500/20'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
              {f !== 'All' && (
                <span className="ml-1.5 text-xs opacity-75">
                  ({bookings.filter(b => b.status === f).length})
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {filteredBookings.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {bookingFilter === 'All' ? 'No bookings yet' : `No ${bookingFilter.toLowerCase()} bookings`}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {bookingFilter === 'All'
                ? 'Start exploring events and book your first experience!'
                : 'Try changing the filter to see other bookings.'}
            </p>
            {bookingFilter === 'All' && (
              <Button
                onClick={() => setClientTab('browse-events')}
                className="gold-gradient-bg text-white border-0 rounded-xl"
              >
                Browse Events <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Card View - Desktop */}
            <div className="hidden lg:grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredBookings.map((b, i) => {
                const StatusIcon = statusIconMap[b.status] || Clock;
                return (
                  <motion.div key={b.id} variants={itemVariants}>
                    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Image */}
                          <div className="w-32 shrink-0 relative overflow-hidden">
                            <img
                              src={b.event?.image || '/events/hero.jpg'}
                              alt={b.event?.title || b.eventType}
                              className="w-full h-full object-cover min-h-[140px]"
                            />
                          </div>
                          {/* Info */}
                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold text-sm">{b.event?.title || b.eventType}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">{b.event?.category || ''}</p>
                              </div>
                              <Badge className={`text-[10px] shrink-0 ${statusColors[b.status] || ''}`}>
                                {b.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="text-xs">
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" /> Date
                                </p>
                                <p className="font-medium mt-0.5">{b.eventDate || '-'}</p>
                              </div>
                              <div className="text-xs">
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <Users className="h-3 w-3" /> Guests
                                </p>
                                <p className="font-medium mt-0.5">{b.guestCount || '-'}</p>
                              </div>
                              <div className="text-xs">
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" /> Budget
                                </p>
                                <p className="font-medium mt-0.5">{b.budget || b.totalAmount || '-'}</p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs rounded-lg h-8"
                                onClick={() => b.event && handleViewEvent(b.event)}
                              >
                                View Details
                              </Button>
                              {b.status === 'PENDING' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs rounded-lg h-8 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                                  onClick={() => handleCancelBooking(b.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Table View - Mobile / Smaller Screens */}
            <div className="lg:hidden">
              <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map(b => (
                        <TableRow key={b.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={b.event?.image || '/events/hero.jpg'}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                              <div>
                                <p className="font-medium text-sm">{b.event?.title || b.eventType}</p>
                                <p className="text-xs text-muted-foreground">{b.guestCount || '-'} guests</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{b.eventDate || '-'}</TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${statusColors[b.status] || ''}`}>{b.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => b.event && handleViewEvent(b.event)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {b.status === 'PENDING' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-red-500"
                                  onClick={() => handleCancelBooking(b.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </motion.div>
    );
  };

  // ─── Contact Staff Tab ─────────────────────────────────────────────────────

  const renderContactStaff = () => (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold mb-1">Contact Staff</h1>
        <p className="text-muted-foreground">Get in touch with our dedicated event management team.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Staff Directory */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-amber-500" /> Our Team
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {staffList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>No staff members listed</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {staffList.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/50 transition-colors group"
                    >
                      <Avatar className="h-12 w-12 ring-2 ring-amber-200/50">
                        <AvatarFallback className="bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 font-semibold text-sm">
                          {s.name?.split(' ').map((n: string) => n.charAt(0)).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" /> {s.email}
                        </p>
                        {s.phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone className="h-3 w-3" /> {s.phone}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Form */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Send className="h-4.5 w-4.5 text-amber-500" /> Send a Message
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="contact-name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Your full name"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="your@email.com"
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Subject</Label>
                  <Input
                    id="contact-subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    placeholder="How can we help?"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="contact-message"
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us about your event requirements, questions, or anything else..."
                    className="rounded-xl resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gold-gradient-bg text-white border-0 hover:opacity-90 font-medium rounded-xl shadow-sm shadow-amber-500/20"
                >
                  <Send className="h-4 w-4 mr-2" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );

  // ─── Profile Tab ───────────────────────────────────────────────────────────

  const renderProfile = () => {
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED').length;

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {/* Profile Header */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-0 shadow-sm">
            <div className="h-24 gold-gradient-bg" />
            <CardContent className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
                <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                  <AvatarFallback className="bg-white text-amber-600 text-2xl font-bold">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{currentUser?.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3.5 w-3.5" /> {currentUser?.email}
                  </p>
                </div>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 self-start sm:self-auto">
                  {currentUser?.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm text-center">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <CalendarCheck className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-2xl font-bold">{bookings.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Bookings</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm text-center">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold">{upcomingBookings}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Upcoming</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm text-center">
            <CardContent className="p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold">{completedBookings}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Details / Edit */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Account Information</CardTitle>
                {!profileEdit && (
                  <Button variant="outline" size="sm" className="text-xs rounded-lg" onClick={() => {
                    setProfileForm({
                      name: currentUser?.name || '',
                      phone: currentUser?.phone || '',
                      bio: currentUser?.bio || '',
                    });
                    setProfileEdit(true);
                  }}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {!profileEdit ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Full Name</p>
                      <p className="text-sm font-medium">{currentUser?.name}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Email Address</p>
                      <p className="text-sm font-medium">{currentUser?.email}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Phone</p>
                      <p className="text-sm font-medium">{currentUser?.phone || 'Not set'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Role</p>
                      <p className="text-sm font-medium">{currentUser?.role}</p>
                    </div>
                  </div>
                  {currentUser?.bio && (
                    <div className="p-4 rounded-xl bg-muted/50">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Bio</p>
                      <p className="text-sm">{currentUser.bio}</p>
                    </div>
                  )}
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setProfileEdit(false);
                    toast.success('Profile updated successfully!');
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">Full Name</Label>
                      <Input
                        id="profile-name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-phone">Phone</Label>
                      <Input
                        id="profile-phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="Your phone number"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-bio">Bio</Label>
                    <Textarea
                      id="profile-bio"
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      className="rounded-xl resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="gold-gradient-bg text-white border-0 hover:opacity-90 rounded-xl font-medium"
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => setProfileEdit(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  // ─── Content Router ────────────────────────────────────────────────────────

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex">
                <Skeleton className="w-1.5 h-24 rounded-l-lg" />
                <Skeleton className="flex-1 h-24 rounded-r-lg" />
              </div>
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      );
    }
    switch (clientTab) {
      case 'dashboard': return renderDashboard();
      case 'browse-events': return renderBrowseEvents();
      case 'my-bookings': return renderMyBookings();
      case 'contact-staff': return renderContactStaff();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  // ─── Main Layout ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-muted/20 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 h-screen sticky top-0 border-r border-sidebar-border/50">
        {renderSidebar()}
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b px-4 py-3 flex items-center justify-between">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              {renderSidebar()}
            </SheetContent>
          </Sheet>
          <span className="font-bold gold-gradient text-lg">EventPro</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl"
                onClick={() => { setClientTab('dashboard'); }}
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </Button>
            )}
            <Badge variant="secondary" className="text-xs rounded-lg">
              {currentUser?.role}
            </Badge>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={clientTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Booking Dialog */}
      {renderBookingDialog()}
    </div>
  );
}
