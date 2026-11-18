'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Menu, X, LogOut, Bell, ChevronDown, Shield,
  ArrowRight, Sparkles, Heart, Briefcase, Cake, Monitor, Music, Users, Baby,
  Palette, Rocket, GraduationCap, MapPin, Phone, Mail, Send, Clock, Star,
  Award, PartyPopper, UserCheck, Calendar, Quote, Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Button,
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Card,
  CardContent,
  Input,
  Textarea,
  Label,
  Separator
} from '@/components/ui/shadcn';

import { useAppStore } from '@/store/useAppStore';

// ==========================================
// 1. NAVBAR
// ==========================================
export function Navbar() {
  const { currentPage, setCurrentPage, currentUser, logout, notifications } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        setScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const navLinks = [
    { label: 'Home', action: () => { setCurrentPage('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { label: 'Events', action: () => { setCurrentPage('landing'); setTimeout(() => { document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); }, 100); } },
    { label: 'About', action: () => { setCurrentPage('landing'); setTimeout(() => { document.getElementById('why-choose-us')?.scrollIntoView({ behavior: 'smooth' }); }, 100); } },
    { label: 'Contact', action: () => { setCurrentPage('landing'); setTimeout(() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }, 100); } },
  ];

  const getPortalPage = () => {
    if (!currentUser) return 'landing';
    switch (currentUser.role) {
      case 'ADMIN': return 'admin-portal';
      case 'STAFF': return 'staff-portal';
      case 'CLIENT': return 'client-portal';
      default: return 'landing';
    }
  };

  const handleNav = (action: () => void) => {
    action();
    setMobileOpen(false);
    setUserMenuOpen(false);
  };

  const isPortal = currentPage !== 'landing' && currentPage !== 'event-detail' && currentPage !== 'login' && currentPage !== 'register';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-emerald-50' : 'bg-transparent'
        } ${isPortal ? 'hidden' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <button onClick={() => handleNav(() => setCurrentPage('landing'))} className="flex items-center gap-2.5">
              <div className="bg-[#059669] text-white p-1.5 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5" fill="currentColor" />
              </div>
              <span className="text-xl md:text-xl font-bold text-slate-900 tracking-tight">Complaint Tracker</span>
            </button>

            {/* Desktop Nav - Hidden to match clean screenshot style */}
            <div className="hidden md:flex items-center gap-1 opacity-0 pointer-events-none">
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-2">
              {currentUser ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => handleNav(() => {
                      setCurrentPage(getPortalPage());
                    })}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                          {currentUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{currentUser.name}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border py-1 z-50"
                        >
                          <button
                            className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors"
                            onClick={() => handleNav(() => setCurrentPage(getPortalPage()))}
                          >
                            Dashboard
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 text-sm hover:bg-accent text-red-500 transition-colors"
                            onClick={() => { logout(); setUserMenuOpen(false); }}
                          >
                            <span className="flex items-center gap-2"><LogOut className="h-4 w-4" /> Logout</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Button variant="outline" className="text-[#059669] border-[#059669]/20 hover:bg-emerald-50 text-sm font-medium rounded-lg px-5 h-9" onClick={() => handleNav(() => setCurrentPage('login'))}>
                    Login
                  </Button>
                  <Button className="bg-[#059669] hover:bg-[#047857] text-white text-sm font-medium rounded-lg px-5 h-9 shadow-sm" onClick={() => handleNav(() => setCurrentPage('register'))}>
                    Register
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b">
                      <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <div className="bg-[#059669] text-white p-1 rounded-md flex items-center justify-center">
                          <Shield className="h-4 w-4" fill="currentColor" />
                        </div>
                        Complaint Tracker
                      </span>
                    </div>
                    <div className="flex-1 py-4">
                      {navLinks.map((link) => (
                        <button
                          key={link.label}
                          className="w-full text-left px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
                          onClick={() => handleNav(link.action)}
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                    <div className="border-t p-4 space-y-2">
                      {currentUser ? (
                        <>
                          <div className="flex items-center gap-3 px-2 py-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {currentUser.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{currentUser.name}</p>
                              <p className="text-xs text-muted-foreground">{currentUser.role}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full text-sm"
                            onClick={() => handleNav(() => setCurrentPage(getPortalPage()))}
                          >
                            Dashboard
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full text-sm text-red-500"
                            onClick={() => { logout(); setMobileOpen(false); }}
                          >
                            <LogOut className="h-4 w-4 mr-2" /> Logout
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full text-sm"
                            onClick={() => handleNav(() => setCurrentPage('login'))}
                          >
                            Login
                          </Button>
                          <Button
                            className="w-full text-sm bg-primary text-primary-foreground"
                            onClick={() => handleNav(() => setCurrentPage('register'))}
                          >
                            Register
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
}

// ==========================================
// 2. HERO SECTION
// ==========================================
export function HeroSection() {
  const { setCurrentPage } = useAppStore();

  const scrollToCategories = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/events/hero.jpg"
          alt="Event Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-amber-400/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 text-amber-200 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            India&apos;s Premier Event Management Company
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Crafting{' '}
            <span className="gold-gradient">Unforgettable</span>
            <br />
            Moments
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
          >
            From intimate celebrations to grand spectacles, we transform your vision into extraordinary experiences. Let our expert team handle every detail.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-6 text-base rounded-full shadow-lg shadow-amber-500/25 group"
              onClick={scrollToCategories}
            >
              Explore Events
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-6 text-base rounded-full backdrop-blur-sm"
              onClick={() => setCurrentPage('register')}
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { num: '500+', label: 'Events Managed' },
            { num: '200+', label: 'Happy Clients' },
            { num: '50+', label: 'Expert Team' },
            { num: '10+', label: 'Years Experience' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-amber-400">{stat.num}</div>
              <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-amber-400"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

// ==========================================
// 3. EVENT CATEGORIES
// ==========================================
const categoriesData = [
  { key: 'wedding', name: 'Wedding', icon: Heart, image: '/events/wedding.jpg', desc: 'Fairytale ceremonies & grand celebrations', price: '₹2L - ₹15L' },
  { key: 'corporate', name: 'Corporate', icon: Briefcase, image: '/events/corporate.jpg', desc: 'Professional conferences & summits', price: '₹1.5L - ₹10L' },
  { key: 'birthday', name: 'Birthday', icon: Cake, image: '/events/birthday.jpg', desc: 'Creative birthday celebrations for all ages', price: '₹25K - ₹3L' },
  { key: 'webinar', name: 'Webinar', icon: Monitor, image: '/events/webinar.jpg', desc: 'Professional virtual event management', price: '₹30K - ₹2L' },
  { key: 'party', name: 'Party', icon: Music, image: '/events/party.jpg', desc: 'Epic themed parties & nightlife experiences', price: '₹50K - ₹5L' },
  { key: 'conference', name: 'Conference', icon: Users, image: '/events/conference.jpg', desc: 'Strategic networking & business events', price: '₹75K - ₹5L' },
  { key: 'babyshower', name: 'Baby Shower', icon: Baby, image: '/events/babyshower.jpg', desc: 'Heartwarming baby shower celebrations', price: '₹15K - ₹1.5L' },
  { key: 'anniversary', name: 'Anniversary', icon: Sparkles, image: '/events/anniversary.jpg', desc: 'Romantic milestone celebrations', price: '₹20K - ₹3L' },
  { key: 'cultural', name: 'Cultural', icon: Palette, image: '/events/cultural.jpg', desc: 'Vibrant festivals & cultural events', price: '₹50K - ₹8L' },
  { key: 'productlaunch', name: 'Product Launch', icon: Rocket, image: '/events/productlaunch.jpg', desc: 'Buzz-creating product launch events', price: '₹1L - ₹10L' },
  { key: 'graduation', name: 'Graduation', icon: GraduationCap, image: '/events/graduation.jpg', desc: 'Dignified academic ceremonies', price: '₹50K - ₹5L' },
];

const categoryContainerVariations = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const categoryItemVariations = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function EventCategories() {
  const { events, setCurrentPage, setSelectedEvent } = useAppStore();

  const handleCategoryClick = (categoryKey: string) => {
    const event = events.find((e) => e.category === categoryKey);
    if (event) {
      setSelectedEvent(event);
      setCurrentPage('event-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section id="categories" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Our <span className="gold-gradient">Event</span> Categories
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From weddings to corporate events, we specialize in creating extraordinary experiences across every category.
          </p>
        </motion.div>

        <motion.div
          variants={categoryContainerVariations}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {categoriesData.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.key} variants={categoryItemVariations}>
                <Card
                  className="group cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  onClick={() => handleCategoryClick(cat.key)}
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-amber-500/90">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-white font-semibold text-sm sm:text-base">{cat.name}</h3>
                      </div>
                      <p className="text-gray-300 text-xs line-clamp-1">{cat.desc}</p>
                    </div>
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs text-muted-foreground">{cat.price}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// 4. FEATURED EVENTS
// ==========================================
const featuredContainerVariations = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const featuredItemVariations = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturedEvents() {
  const { events, setCurrentPage, setSelectedEvent } = useAppStore();
  const featured = events.filter((e) => e.isFeatured).slice(0, 4);

  const handleViewEvent = (event: typeof featured[0]) => {
    setSelectedEvent(event);
    setCurrentPage('event-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Featured <span className="gold-gradient">Events</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular event packages, each designed to deliver exceptional experiences.
          </p>
        </motion.div>

        <motion.div
          variants={featuredContainerVariations}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featured.map((event) => (
            <motion.div key={event.id} variants={featuredItemVariations}>
              <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={event.image || '/events/hero.jpg'}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-amber-500 text-white border-0">
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </Badge>
                  {event.priceRange && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                      <span className="text-white text-xs font-semibold">{event.priceRange}</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                  <h3 className="font-semibold text-base mb-2 line-clamp-1">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                    {event.shortDesc || event.description.slice(0, 100)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    {event.duration && <span>⏱ {event.duration}</span>}
                    {event.capacity && <span>👥 {event.capacity}</span>}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground group/btn text-sm"
                    onClick={() => handleViewEvent(event)}
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// 5. WHY CHOOSE US
// ==========================================
const featuresData = [
  {
    icon: Shield,
    title: 'Expert Planning',
    desc: 'Our seasoned event planners bring years of experience and creative vision to every project, ensuring flawless execution.',
  },
  {
    icon: Star,
    title: 'Custom Design',
    desc: 'Every event is uniquely crafted to match your vision, style, and preferences with personalized attention to detail.',
  },
  {
    icon: Clock,
    title: 'On-Time Delivery',
    desc: 'We pride ourselves on punctual execution. Every milestone is met on schedule so you can enjoy a stress-free experience.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    desc: 'Our dedicated support team is available round the clock to address your queries and ensure smooth event planning.',
  },
  {
    icon: Wallet,
    title: 'Budget Friendly',
    desc: 'Premium quality doesn\'t have to break the bank. We offer flexible packages that deliver exceptional value at every price point.',
  },
  {
    icon: Award,
    title: 'Quality Assurance',
    desc: 'From venue selection to final cleanup, we maintain the highest standards of quality across every aspect of your event.',
  },
];

const whyChooseContainerVariations = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const whyChooseItemVariations = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Choose <span className="gold-gradient">EventPro</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We go above and beyond to make every event a resounding success. Here&apos;s what sets us apart.
          </p>
        </motion.div>

        <motion.div
          variants={whyChooseContainerVariations}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featuresData.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={whyChooseItemVariations}>
                <Card className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full">
                  <CardContent className="p-6 sm:p-8">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// 6. STATS SECTION
// ==========================================
const statsData = [
  { icon: PartyPopper, value: 500, suffix: '+', label: 'Events Managed', color: 'text-amber-500' },
  { icon: Users, value: 200, suffix: '+', label: 'Happy Clients', color: 'text-emerald-500' },
  { icon: UserCheck, value: 50, suffix: '+', label: 'Expert Team', color: 'text-amber-600' },
  { icon: Calendar, value: 10, suffix: '+', label: 'Years Experience', color: 'text-emerald-600' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const stepTime = Math.max(Math.floor(duration / value), 20);
    const timer = setInterval(() => {
      start += Math.ceil(value / (duration / stepTime));
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function StatsSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 gold-gradient-bg opacity-95" />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Our <span className="text-amber-300">Achievements</span> in Numbers
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Over a decade of excellence in creating memorable events across India.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {statsData.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-4">
                  <Icon className="h-8 w-8 text-amber-300" />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/70 text-sm sm:text-base">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 7. TESTIMONIALS SECTION
// ==========================================
const testimonialsContainerVariations = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const testimonialsItemVariations = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function TestimonialsSection() {
  const { testimonials } = useAppStore();

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What Our <span className="gold-gradient">Clients</span> Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from the people who trusted us with their most special moments.
          </p>
        </motion.div>

        <motion.div
          variants={testimonialsContainerVariations}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.id} variants={testimonialsItemVariations}>
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow h-full">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-sm leading-relaxed mb-6 text-muted-foreground">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      {testimonial.role && (
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// 8. CONTACT SECTION
// ==========================================
export function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.message || 'Failed to send message');
      }
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Get In <span className="gold-gradient">Touch</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have questions or ready to plan your event? Reach out and let&apos;s start creating something amazing together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Our Office</h4>
                  <p className="text-sm text-muted-foreground">
                    42, MG Road, Connaught Place<br />New Delhi, India - 110001
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Phone</h4>
                  <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                  <p className="text-sm text-muted-foreground">+91 11 2345 6789</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <p className="text-sm text-muted-foreground">info@eventpro.com</p>
                  <p className="text-sm text-muted-foreground">support@eventpro.com</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Working Hours</h4>
                  <p className="text-sm text-muted-foreground">Mon - Sat: 9:00 AM - 7:00 PM</p>
                  <p className="text-sm text-muted-foreground">Sunday: By Appointment</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                     <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help you?"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your event requirements..."
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            <Card className="border-0 shadow-md mt-6 overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-10 w-10 text-amber-600 mx-auto mb-2" />
                  <p className="text-amber-800 font-medium">42, MG Road, Connaught Place</p>
                  <p className="text-amber-700 text-sm">New Delhi, India</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 9. FOOTER
// ==========================================
export function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thanks for subscribing to our newsletter!');
    setEmail('');
  };

  const quickLinks = [
    { label: 'Home', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: 'Events', action: () => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'About Us', action: () => document.getElementById('why-choose-us')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Contact', action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) },
  ];

  const services = ['Wedding Planning', 'Corporate Events', 'Birthday Parties', 'Conferences', 'Webinars', 'Product Launches'];

  const socials = [
    { icon: Facebook, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-zinc-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <img src="/events/logo.png" alt="EventPro" className="h-9 w-9 rounded-full" />
              <span className="text-xl font-bold text-white">EventPro</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              India&apos;s premier event management company, crafting unforgettable moments since 2014. From intimate gatherings to grand celebrations, we make every event extraordinary.
            </p>
            <div className="flex gap-3">
              {socials.map((s, i) => {
                const Icon = s.icon;
                return (
                  <a
                    key={i}
                    href={s.href}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button onClick={link.action} className="text-sm hover:text-primary transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-5">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service} className="text-sm">{service}</li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-5">Newsletter</h4>
            <p className="text-sm mb-4">
              Subscribe to get the latest event trends, tips, and exclusive offers.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <Input
                placeholder="Your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/10 text-white placeholder:text-gray-500 focus:border-primary"
              />
              <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-10 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2026 EventPro. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by EventPro Team
          </p>
        </div>
      </div>
    </footer>
  );
}
