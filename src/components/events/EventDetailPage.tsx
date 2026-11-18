'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Clock, Users, DollarSign, Calendar, CheckCircle2,
  Lightbulb, Image as ImageIcon, Info, Send, Star, Heart, Share2, MapPin,
  Phone, Mail, Sparkles, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAppStore, type EventItem } from '@/store/useAppStore';
import { toast } from 'sonner';

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer: any = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function EventDetailPage() {
  const {
    selectedEvent, setCurrentPage, currentUser, events, setSelectedEvent,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState('overview');
  const [bookingForm, setBookingForm] = useState({
    eventDate: '',
    guestCount: '',
    budget: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const rawGallery: string[] = selectedEvent?.gallery
    ? (() => { try { return JSON.parse(selectedEvent.gallery); } catch { return []; } })()
    : [];
  const gallery = rawGallery.length > 0 ? rawGallery : [
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80'
  ];
  const features: string[] = selectedEvent?.features
    ? (() => { try { return JSON.parse(selectedEvent.features); } catch { return []; } })()
    : [];
  const ideas: string[] = selectedEvent?.ideas
    ? (() => { try { return JSON.parse(selectedEvent.ideas); } catch { return []; } })()
    : [];

  // Related events: same category (excluding current) + featured fallback
  const relatedEvents = useMemo(() => {
    if (!selectedEvent || !events.length) return [];
    const sameCategory = events.filter(
      (e) => e.id !== selectedEvent.id && e.category === selectedEvent.category && e.status === 'PUBLISHED'
    );
    const featured = events.filter(
      (e) => e.id !== selectedEvent.id && e.isFeatured && e.status === 'PUBLISHED' && !sameCategory.find((s) => s.id === e.id)
    );
    return [...sameCategory, ...featured].slice(0, 4);
  }, [selectedEvent, events]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!selectedEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/40" />
          <p className="text-muted-foreground text-lg">Event not found</p>
          <Button variant="outline" onClick={() => setCurrentPage('landing')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Please login to book an event');
      setCurrentPage('login');
      return;
    }
    if (!bookingForm.eventDate) {
      toast.error('Please select an event date');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          eventId: selectedEvent.id,
          eventType: selectedEvent.category,
          ...bookingForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Booking request submitted successfully!');
        setBookingForm({ eventDate: '', guestCount: '', budget: '', message: '' });
      } else {
        toast.error(data.message || 'Failed to submit booking');
      }
    } catch {
      toast.error('Failed to submit booking');
    }
    setSubmitting(false);
  };

  const goBack = () => {
    if (!currentUser) {
      setCurrentPage('landing');
    } else if (currentUser.role === 'ADMIN') {
      setCurrentPage('admin-portal');
    } else if (currentUser.role === 'STAFF') {
      setCurrentPage('staff-portal');
    } else {
      setCurrentPage('client-portal');
    }
  };

  const handleViewEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setActiveTab('overview');
    setBookingForm({ eventDate: '', guestCount: '', budget: '', message: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async () => {
    const shareText = `Check out ${selectedEvent.title} - ${selectedEvent.shortDesc || selectedEvent.category}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: selectedEvent.title, text: shareText });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast.success('Event link copied to clipboard!');
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites!');
  };

  const scrollToBooking = () => {
    const el = document.getElementById('booking-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const infoPills = [
    selectedEvent.priceRange ? { icon: DollarSign, label: 'Price', value: selectedEvent.priceRange } : null,
    selectedEvent.duration ? { icon: Clock, label: 'Duration', value: selectedEvent.duration } : null,
    selectedEvent.capacity ? { icon: Users, label: 'Capacity', value: selectedEvent.capacity } : null,
    { icon: Calendar, label: 'Category', value: selectedEvent.category.charAt(0).toUpperCase() + selectedEvent.category.slice(1) },
  ].filter(Boolean) as { icon: React.ElementType; label: string; value: string }[];

  return (
    <div className="min-h-screen bg-background">
      {/* ======================== HERO SECTION ======================== */}
      <section className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <img
            src={selectedEvent.image || '/events/hero.jpg'}
            alt={selectedEvent.title}
            className="w-full h-full object-cover"
          />
        </motion.div>
        {/* Darker gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 w-full">
            <div className="flex items-end justify-between gap-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 mb-5 -ml-2"
                  onClick={goBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>

                <Badge className="bg-amber-500/90 backdrop-blur-sm text-white border-0 mb-4 text-xs font-semibold tracking-wide uppercase px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {selectedEvent.category.charAt(0).toUpperCase() + selectedEvent.category.slice(1)}
                </Badge>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight tracking-tight">
                  {selectedEvent.title}
                </h1>

                {selectedEvent.shortDesc && (
                  <p className="text-white/70 text-base sm:text-lg max-w-2xl leading-relaxed mb-6">
                    {selectedEvent.shortDesc}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-white/60 text-sm">
                  {selectedEvent.priceRange && (
                    <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-amber-400" /> {selectedEvent.priceRange}
                    </span>
                  )}
                  {selectedEvent.duration && (
                    <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-400" /> {selectedEvent.duration}
                    </span>
                  )}
                  {selectedEvent.capacity && (
                    <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                      <Users className="h-3.5 w-3.5 text-amber-400" /> {selectedEvent.capacity}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Floating Book Now button on the right */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="hidden lg:block"
              >
                <Button
                  size="lg"
                  onClick={scrollToBooking}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25 rounded-full px-8 py-6 text-base font-semibold h-auto whitespace-nowrap"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Book Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60V30C360 0 1080 0 1440 30V60H0Z" fill="oklch(0.99 0.005 85)" />
          </svg>
        </div>
      </section>

      {/* ======================== EVENT INFO BAR ======================== */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10"
      >
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {infoPills.map((pill, i) => (
                <motion.div
                  key={pill.label}
                  variants={fadeUp}
                  custom={i}
                  className="flex items-center gap-2.5 bg-gradient-to-r from-background to-muted/50 rounded-full px-4 py-2.5 sm:px-5 sm:py-3 border border-border/50"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <pill.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">{pill.label}</p>
                    <p className="text-sm sm:text-base font-semibold">{pill.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* ======================== MAIN CONTENT AREA ======================== */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* ========== LEFT COLUMN ========== */}
          <motion.div variants={fadeUp} custom={0} className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8 w-full sm:w-auto flex flex-wrap h-auto p-1 bg-muted/50 rounded-xl">
                {[
                  { value: 'overview', icon: Info, label: 'Overview' },
                  { value: 'gallery', icon: ImageIcon, label: 'Gallery' },
                  { value: 'features', icon: CheckCircle2, label: 'Features' },
                  { value: 'ideas', icon: Lightbulb, label: 'Ideas' },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-medium transition-all"
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* ---- OVERVIEW TAB ---- */}
                  <TabsContent value="overview" className="mt-0">
                    <Card className="border-0 shadow-sm overflow-hidden">
                      <div className="h-1.5 gold-gradient-bg" />
                      <CardContent className="p-6 sm:p-8">
                        <h3 className="text-2xl font-bold mb-2">
                          About This <span className="gold-gradient">Event</span>
                        </h3>
                        <p className="text-muted-foreground text-sm mb-6">
                          Everything you need to know about this exceptional experience
                        </p>

                        <div className="space-y-4 mb-10">
                          {selectedEvent.description.split('\n\n').map((para, i) => (
                            <motion.p
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="text-muted-foreground leading-[1.8] text-[15px]"
                            >
                              {para}
                            </motion.p>
                          ))}
                        </div>

                        {/* Key Highlights */}
                        <Separator className="mb-8" />
                        <h4 className="text-lg font-semibold mb-5 flex items-center gap-2">
                          <Star className="h-5 w-5 text-amber-500" />
                          Key Highlights
                        </h4>
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                          {features.slice(0, 4).map((feature, i) => (
                            <motion.div
                              key={i}
                              variants={fadeUp}
                              custom={i}
                              className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-card border border-amber-100 dark:border-amber-900/30 hover:shadow-md transition-shadow"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
                                <Sparkles className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold mb-0.5">Highlight {i + 1}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{feature}</p>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>

                        {/* Sample Decorations */}
                        <Separator className="my-8" />
                        <h4 className="text-lg font-semibold mb-5 flex items-center gap-2">
                          <ImageIcon className="h-5 w-5 text-amber-500" />
                          Sample Decoration Images
                        </h4>
                        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                          {gallery.slice(0, 3).map((img, i) => (
                            <motion.div key={i} variants={fadeUp} custom={i} className="rounded-xl overflow-hidden shadow-sm border border-border">
                              <img src={img} alt="decoration" className="h-40 w-full object-cover transition-transform duration-500 hover:scale-110" />
                            </motion.div>
                          ))}
                        </motion.div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ---- GALLERY TAB ---- */}
                  <TabsContent value="gallery" className="mt-0">
                    {gallery.length > 0 ? (
                      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                        {gallery.map((img: string, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08, duration: 0.5 }}
                            className="break-inside-avoid relative rounded-xl overflow-hidden group cursor-pointer"
                          >
                            <img
                              src={img}
                              alt={`${selectedEvent.title} ${i + 1}`}
                              className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              style={{ height: i % 3 === 0 ? '320px' : i % 3 === 1 ? '240px' : '280px' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                              <div className="p-4">
                                <p className="text-white text-sm font-medium">
                                  {selectedEvent.title} &mdash; Photo {i + 1}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-16 text-center">
                          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-5">
                            <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                          <p className="text-lg font-medium text-muted-foreground mb-2">Gallery Coming Soon</p>
                          <p className="text-sm text-muted-foreground/60">
                            We&apos;re preparing stunning photos for this event
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* ---- FEATURES TAB ---- */}
                  <TabsContent value="features" className="mt-0">
                    <Card className="border-0 shadow-sm overflow-hidden">
                      <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                      <CardContent className="p-6 sm:p-8">
                        <h3 className="text-2xl font-bold mb-2">
                          What&apos;s <span className="text-emerald-600 dark:text-emerald-400">Included</span>
                        </h3>
                        <p className="text-muted-foreground text-sm mb-8">
                          Everything you get when you book this event package
                        </p>

                        {features.length > 0 ? (
                          <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                          >
                            {features.map((feature: string, i: number) => (
                              <motion.div
                                key={i}
                                variants={fadeUp}
                                custom={i}
                                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-card border border-emerald-100 dark:border-emerald-900/30 group hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-all"
                              >
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
                                  className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </motion.div>
                                <span className="text-sm leading-relaxed pt-1">{feature}</span>
                              </motion.div>
                            ))}
                          </motion.div>
                        ) : (
                          <div className="text-center py-10">
                            <CheckCircle2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">Feature details coming soon</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ---- IDEAS TAB ---- */}
                  <TabsContent value="ideas" className="mt-0">
                    {ideas.length > 0 ? (
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        {ideas.map((idea: string, i: number) => (
                          <motion.div
                            key={i}
                            variants={fadeUp}
                            custom={i}
                          >
                            <Card className="border-amber-200 dark:border-amber-800/40 bg-gradient-to-br from-amber-50 via-amber-50/50 to-white dark:from-amber-950/30 dark:via-amber-950/15 dark:to-card hover:shadow-lg hover:shadow-amber-500/5 transition-all overflow-hidden group">
                              <div className="h-1 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                              <CardContent className="p-5 sm:p-6">
                                <div className="flex items-start gap-4">
                                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/25 group-hover:scale-110 transition-transform">
                                    <Lightbulb className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1.5 uppercase tracking-wider">
                                      Idea #{i + 1}
                                    </p>
                                    <p className="text-sm leading-relaxed text-foreground/90">{idea}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </motion.div>
                    ) : (
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-16 text-center">
                          <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-5">
                            <Lightbulb className="h-10 w-10 text-amber-400/40" />
                          </div>
                          <p className="text-lg font-medium text-muted-foreground mb-2">Ideas Coming Soon</p>
                          <p className="text-sm text-muted-foreground/60">
                            Creative inspiration for this event is on its way
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </motion.div>

          {/* ========== RIGHT COLUMN (SIDEBAR) ========== */}
          <motion.div variants={fadeUp} custom={1} className="space-y-6">
            {/* Booking Form Card */}
            <Card id="booking-section" className="border-0 shadow-xl overflow-hidden sticky top-24">
              {/* Gradient header */}
              <div className="gold-gradient-bg p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <CardTitle className="text-xl font-bold text-white relative z-10 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Book This Event
                </CardTitle>
                <p className="text-white/70 text-sm mt-1.5 relative z-10">
                  Fill in the details and we&apos;ll get back to you
                </p>
              </div>

              <CardContent className="p-6 space-y-5">
                {!currentUser ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 font-medium">
                      Please sign in to book this event
                    </p>
                    <Button
                      className="w-full gold-gradient-bg text-white font-semibold hover:opacity-90 transition-opacity"
                      onClick={() => setCurrentPage('login')}
                    >
                      Sign In to Book
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                ) : currentUser.role === 'CLIENT' ? (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleBooking}
                    className="space-y-5"
                  >
                    <div className="space-y-2 mb-4">
                      <Label className="text-sm font-medium">Select Available Date <span className="text-red-500">*</span></Label>
                      <div className="bg-white border rounded-xl p-3 sm:p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3 text-sm font-semibold">
                          <button type="button" className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                          <span className="text-foreground">April 2026</span>
                          <button type="button" className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-md transition-colors"><ChevronRight className="h-4 w-4" /></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">
                          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 30 }).map((_, i) => {
                            const date = i + 1;
                            // Random pseudo-booked days for visual demo
                            const isBooked = [4, 12, 18, 25, 26, 29].includes(date);
                            const dateString = `2026-04-${date.toString().padStart(2, '0')}`;
                            const isSelected = bookingForm.eventDate === dateString;
                            
                            return (
                              <button
                                key={date}
                                type="button"
                                disabled={isBooked}
                                onClick={() => setBookingForm({ ...bookingForm, eventDate: dateString })}
                                className={`text-sm aspect-square flex items-center justify-center rounded-lg transition-all border ${
                                  isBooked ? 'bg-red-50 border-red-100 text-red-400 cursor-not-allowed line-through decoration-red-300' 
                                  : isSelected ? 'bg-amber-500 border-amber-500 text-white font-bold shadow-md shadow-amber-500/20'
                                  : 'hover:border-amber-300 hover:bg-amber-50 text-foreground border-transparent'
                                }`}
                              >
                                {date}
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-3 mt-4 text-[11px] font-medium text-muted-foreground justify-center">
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Selected</span>
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-border bg-white"></span> Free</span>
                          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-200"></span> Booked</span>
                        </div>
                      </div>
                      {/* Hidden actual input for standard form submission compat */}
                      <input type="hidden" value={bookingForm.eventDate} required />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Guest Count</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g., 200"
                          value={bookingForm.guestCount}
                          onChange={(e) => setBookingForm({ ...bookingForm, guestCount: e.target.value })}
                          className="pl-10 h-11 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Budget Range</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="e.g., $5,000"
                          value={bookingForm.budget}
                          onChange={(e) => setBookingForm({ ...bookingForm, budget: e.target.value })}
                          className="pl-10 h-11 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Special Message</Label>
                      <Textarea
                        placeholder="Tell us about your requirements..."
                        rows={3}
                        value={bookingForm.message}
                        onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                        className="rounded-lg resize-none"
                      />
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button
                        type="submit"
                        className="w-full h-12 text-base font-semibold rounded-lg gold-gradient-bg text-white hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/15"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full mr-2"
                          />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        {submitting ? 'Submitting...' : 'Submit Booking Request'}
                      </Button>
                    </motion.div>
                  </motion.form>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                      <Info className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Booking is available for client accounts only.
                    </p>
                  </div>
                )}

                <Separator />

                {/* Event Quick Info */}
                <div className="space-y-3.5">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Event Details</h4>
                  {selectedEvent.priceRange && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-3.5 w-3.5" /> Price Range
                      </span>
                      <span className="font-semibold">{selectedEvent.priceRange}</span>
                    </div>
                  )}
                  {selectedEvent.duration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" /> Duration
                      </span>
                      <span className="font-semibold">{selectedEvent.duration}</span>
                    </div>
                  )}
                  {selectedEvent.capacity && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Users className="h-3.5 w-3.5" /> Capacity
                      </span>
                      <span className="font-semibold">{selectedEvent.capacity}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Share & Favorite */}
                <div className="flex gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full rounded-lg h-11 font-medium"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                    <Button
                      variant={isFavorite ? 'default' : 'outline'}
                      className={`w-full rounded-lg h-11 font-medium transition-all ${
                        isFavorite
                          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                          : ''
                      }`}
                      onClick={handleFavorite}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                      {isFavorite ? 'Saved' : 'Save'}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* ======================== RELATED EVENTS SECTION ======================== */}
      {relatedEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="text-center mb-10 sm:mb-12">
              <Badge variant="secondary" className="mb-3 text-xs tracking-wide uppercase">
                <Sparkles className="h-3 w-3 mr-1" /> Explore More
              </Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                You May Also <span className="gold-gradient">Like</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Discover more amazing events that match your interests
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {relatedEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  variants={fadeUp}
                  custom={i}
                >
                  <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden group cursor-pointer h-full flex flex-col"
                    onClick={() => handleViewEvent(event)}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image || '/events/hero.jpg'}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      {event.isFeatured && (
                        <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0 text-[10px] font-bold tracking-wider uppercase shadow-sm">
                          <Star className="h-3 w-3 mr-1 fill-current" /> Featured
                        </Badge>
                      )}
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-white/90 backdrop-blur-sm text-foreground border-0 text-[10px] font-semibold">
                          {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-base mb-1.5 line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2 flex-1">
                        {event.shortDesc || event.description.slice(0, 100) + '...'}
                      </p>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                        {event.priceRange && (
                          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {event.priceRange}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs font-medium text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 ml-auto -mr-1"
                        >
                          View Details
                          <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ======================== BOTTOM CTA BAR ======================== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-border/50 bg-muted/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-1">
                Ready to plan your <span className="gold-gradient">dream event</span>?
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Contact us today and let&apos;s make it happen
              </p>
            </div>
            <div className="flex gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  onClick={scrollToBooking}
                  className="gold-gradient-bg text-white font-semibold rounded-full px-6 shadow-lg shadow-amber-500/15 hover:opacity-90 transition-opacity"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={goBack}
                  className="rounded-full px-6"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
