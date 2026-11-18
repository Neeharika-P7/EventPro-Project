'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Bell, ChevronDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/useAppStore';

export default function Navbar() {
  const { currentPage, setCurrentPage, currentUser, logout, notifications } = useAppStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setScrolled(window.scrollY > 20);
    });
  }

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
