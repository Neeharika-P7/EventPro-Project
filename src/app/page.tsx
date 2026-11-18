'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import EventCategories from '@/components/landing/EventCategories';
import FeaturedEvents from '@/components/landing/FeaturedEvents';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import ContactSection from '@/components/landing/ContactSection';
import Footer from '@/components/landing/Footer';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import EventDetailPage from '@/components/events/EventDetailPage';
import ClientPortal from '@/components/portal/ClientPortal';
import AdminPortal from '@/components/portal/AdminPortal';
import StaffPortal from '@/components/portal/StaffPortal';
import { Skeleton } from '@/components/ui/skeleton';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

function LoadingLanding() {
  return (
    <div className="min-h-screen">
      <div className="h-16 flex items-center justify-between px-6">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <Skeleton className="h-screen w-full" />
      <div className="py-20 px-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48 mx-auto mb-4" />
        <Skeleton className="h-4 w-64 mx-auto mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-56 rounded-xl" />)}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { currentPage, events, setEvents, testimonials, setTestimonials, currentUser } = useAppStore();
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, testRes] = await Promise.all([
          fetch('/api/events').then(r => r.json()),
          fetch('/api/testimonials').then(r => r.json()),
        ]);
        if (eventsRes.success) setEvents(eventsRes.events);
        if (testRes.success) setTestimonials(testRes.testimonials);
      } catch {
        // silent
      }
      setDataLoaded(true);
    };
    fetchData();
  }, []);

  // Check persisted user session
  useEffect(() => {
    const savedUser = localStorage.getItem('eventpro_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const store = useAppStore.getState();
        store.setCurrentUser(user);
      } catch {
        // ignore
      }
    }
  }, []);

  // Persist user on change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('eventpro_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('eventpro_user');
    }
  }, [currentUser]);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        if (!dataLoaded) return <LoadingLanding />;
        return (
          <div>
            <Navbar />
            <HeroSection />
            <EventCategories />
            <FeaturedEvents />
            <WhyChooseUs />
            <StatsSection />
            <TestimonialsSection />
            <ContactSection />
            <Footer />
          </div>
        );

      case 'login':
        return <LoginForm />;

      case 'register':
        return <RegisterForm />;

      case 'event-detail':
        return <EventDetailPage />;

      case 'client-portal':
        return <ClientPortal />;

      case 'admin-portal':
        return <AdminPortal />;

      case 'staff-portal':
        return <StaffPortal />;

      default:
        return <LoginForm />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
}
