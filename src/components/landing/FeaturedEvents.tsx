'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturedEvents() {
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
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featured.map((event) => (
            <motion.div key={event.id} variants={item}>
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
