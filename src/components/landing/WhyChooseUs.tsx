'use client';

import { motion } from 'framer-motion';
import { Star, Shield, Clock, Headphones, Wallet, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function WhyChooseUs() {
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
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={item}>
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
