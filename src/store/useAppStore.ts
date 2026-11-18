import { create } from 'zustand';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc?: string;
  category: string;
  priceRange?: string;
  duration?: string;
  capacity?: string;
  image?: string;
  gallery?: string;
  features?: string;
  ideas?: string;
  isFeatured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingItem {
  id: string;
  userId: string;
  eventId: string;
  eventType: string;
  eventDate?: string;
  guestCount?: string;
  budget?: string;
  message?: string;
  status: string;
  totalAmount?: string;
  createdAt: string;
  user?: { id: string; name: string; email: string; phone?: string };
  event?: { id: string; title: string; category: string; image?: string };
  payment?: PaymentItem | null;
}

export interface PaymentItem {
  id: string;
  bookingId: string;
  amount: string;
  method?: string;
  status: string;
  transactionId?: string;
  paidAt?: string;
}

export interface StaffAssignmentItem {
  id: string;
  eventId: string;
  staffId: string;
  role?: string;
  status: string;
  notes?: string;
  assignedAt: string;
  completedAt?: string;
  event?: { id: string; title: string; category: string; image?: string };
  staff?: { id: string; name: string; email: string; phone?: string };
}

export interface TestimonialItem {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  avatar?: string;
  eventId?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
  isRead: boolean;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export type PageType = 'landing' | 'event-detail' | 'login' | 'register' | 'client-portal' | 'admin-portal' | 'staff-portal';

export interface PortalTab {
  client: 'dashboard' | 'browse-events' | 'my-bookings' | 'contact-staff' | 'profile';
  admin: 'dashboard' | 'manage-events' | 'manage-bookings' | 'manage-staff' | 'staff-assignments' | 'payments' | 'messages' | 'profile';
  staff: 'dashboard' | 'my-assignments' | 'event-details' | 'my-schedule' | 'client-bookings' | 'contact-client' | 'profile';
}

interface AppState {
  currentPage: PageType;
  selectedEvent: EventItem | null;
  currentUser: CurrentUser | null;
  notifications: NotificationItem[];
  events: EventItem[];
  testimonials: TestimonialItem[];
  bookings: BookingItem[];
  staffAssignments: StaffAssignmentItem[];
  contactMessages: ContactMessageItem[];
  clientTab: PortalTab['client'];
  adminTab: PortalTab['admin'];
  staffTab: PortalTab['staff'];
  staffSelectedEvent: EventItem | null;

  setCurrentPage: (page: PageType) => void;
  setSelectedEvent: (event: EventItem | null) => void;
  setCurrentUser: (user: CurrentUser | null) => void;
  setNotifications: (notifications: NotificationItem[]) => void;
  setEvents: (events: EventItem[]) => void;
  setTestimonials: (testimonials: TestimonialItem[]) => void;
  setBookings: (bookings: BookingItem[]) => void;
  setStaffAssignments: (assignments: StaffAssignmentItem[]) => void;
  setContactMessages: (messages: ContactMessageItem[]) => void;
  setClientTab: (tab: PortalTab['client']) => void;
  setAdminTab: (tab: PortalTab['admin']) => void;
  setStaffTab: (tab: PortalTab['staff']) => void;
  setStaffSelectedEvent: (event: EventItem | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'landing',
  selectedEvent: null,
  currentUser: null,
  notifications: [],
  events: [],
  testimonials: [],
  bookings: [],
  staffAssignments: [],
  contactMessages: [],
  clientTab: 'dashboard',
  adminTab: 'dashboard',
  staffTab: 'dashboard',
  staffSelectedEvent: null,

  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setNotifications: (notifications) => set({ notifications }),
  setEvents: (events) => set({ events }),
  setTestimonials: (testimonials) => set({ testimonials }),
  setBookings: (bookings) => set({ bookings }),
  setStaffAssignments: (assignments) => set({ staffAssignments: assignments }),
  setContactMessages: (messages) => set({ contactMessages: messages }),
  setClientTab: (tab) => set({ clientTab: tab }),
  setAdminTab: (tab) => set({ adminTab: tab }),
  setStaffTab: (tab) => set({ staffTab: tab }),
  setStaffSelectedEvent: (event) => set({ staffSelectedEvent: event }),
  logout: () => set({
    currentUser: null,
    currentPage: 'landing',
    notifications: [],
    bookings: [],
    staffAssignments: [],
    clientTab: 'dashboard',
    adminTab: 'dashboard',
    staffTab: 'dashboard',
  }),
}));
