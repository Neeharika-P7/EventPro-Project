'use client';

import { motion } from 'framer-motion';
import {
  Heart, Briefcase, Cake, Monitor, Music, Users, Baby, Sparkles, Palette, Rocket, GraduationCap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';

const categories = [
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function EventCategories() {
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
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <motion.div key={cat.key} variants={item}>
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
