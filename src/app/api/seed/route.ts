import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear existing data
    await db.booking.deleteMany();
    await db.payment.deleteMany();
    await db.staffAssignment.deleteMany();
    await db.notification.deleteMany();
    await db.contactMessage.deleteMany();
    await db.testimonial.deleteMany();
    await db.event.deleteMany();
    await db.user.deleteMany();

    // Create Users
    const admin = await db.user.create({
      data: {
        email: 'admin@eventpro.com',
        name: 'Rajesh Kumar',
        password: 'admin123',
        role: 'ADMIN',
        phone: '+91 98765 43210',
        bio: 'Senior Event Manager with 15+ years of experience',
      },
    });

    const staff1 = await db.user.create({
      data: {
        email: 'priya@eventpro.com',
        name: 'Priya Sharma',
        password: 'staff123',
        role: 'STAFF',
        phone: '+91 87654 32109',
        bio: 'Wedding & Celebration Specialist',
      },
    });

    const staff2 = await db.user.create({
      data: {
        email: 'vikram@eventpro.com',
        name: 'Vikram Singh',
        password: 'staff123',
        role: 'STAFF',
        phone: '+91 76543 21098',
        bio: 'Corporate Event Coordinator',
      },
    });

    const staff3 = await db.user.create({
      data: {
        email: 'anita@eventpro.com',
        name: 'Anita Patel',
        password: 'staff123',
        role: 'STAFF',
        phone: '+91 65432 10987',
        bio: 'Digital & Webinar Expert',
      },
    });

    const client1 = await db.user.create({
      data: {
        email: 'client@test.com',
        name: 'Sneha Reddy',
        password: 'client123',
        role: 'CLIENT',
        phone: '+91 54321 09876',
      },
    });

    const client2 = await db.user.create({
      data: {
        email: 'arjun@test.com',
        name: 'Arjun Mehta',
        password: 'client123',
        role: 'CLIENT',
        phone: '+91 43210 98765',
      },
    });

    // Create Events
    const events = await Promise.all([
      db.event.create({
        data: {
          title: 'Dream Wedding Celebration',
          slug: 'dream-wedding',
          category: 'wedding',
          shortDesc: 'Create your perfect fairytale wedding with our comprehensive planning and execution services.',
          description: `Your wedding day deserves nothing but perfection. At EventPro, we specialize in crafting unforgettable wedding experiences that reflect your unique love story. From intimate ceremonies to grand celebrations, our dedicated team handles every detail with precision and care.\n\nOur wedding planning service includes complete venue decoration, catering management, entertainment coordination, photography & videography, invitation design, guest management, and day-of coordination. We work with the finest vendors in the industry to ensure every element of your wedding exceeds expectations.\n\nWhether you envision a traditional ceremony, a destination wedding, or a contemporary celebration, our experienced planners bring your vision to life. We handle the stress so you can focus on creating beautiful memories that last a lifetime.`,
          priceRange: '₹2,00,000 - ₹15,00,000',
          duration: '1-3 Days',
          capacity: '50-2000+ Guests',
          image: '/events/wedding.jpg',
          gallery: JSON.stringify(['/events/wedding.jpg', '/events/wedding2.jpg', '/events/wedding3.jpg']),
          features: JSON.stringify([
            'Complete Venue Decoration & Design',
            'Catering & Menu Curation',
            'Photography & Videography',
            'DJ & Live Music Arrangement',
            'Mehendi & Sangeet Coordination',
            'Invitation Design & Distribution',
            'Guest Management & Hospitality',
            'Transportation Arrangement',
            'Bridal Makeup & Styling',
            'Honeymoon Planning Assistance'
          ]),
          ideas: JSON.stringify([
            'Choose a theme that tells your love story - vintage, royal, garden, or beach',
            'Plan a unique entrance with fireworks or petal shower',
            'Create a digital photo booth with fun props',
            'Arrange a surprise performance for your partner',
            'Design personalized wedding favors for guests',
            'Set up a live cooking station for interactive dining'
          ]),
          isFeatured: true,
          status: 'ACTIVE',
        },
      }),
      db.event.create({
        data: {
          title: 'Corporate Conference & Summit',
          slug: 'corporate-conference',
          category: 'corporate',
          shortDesc: 'Professional conference management with cutting-edge technology and seamless execution.',
          description: `Elevate your corporate events with our professional conference management services. We specialize in organizing high-impact conferences, summits, and business gatherings that leave lasting impressions on your attendees.\n\nOur corporate event team brings expertise in venue selection, stage design, audio-visual setup, registration management, speaker coordination, and post-event analytics. We understand the importance of brand representation and ensure every aspect aligns with your corporate identity.\n\nFrom small executive meetings to large-scale industry conferences with thousands of attendees, we deliver flawless execution. Our technology-driven approach includes live streaming, virtual participation options, interactive Q&A systems, and real-time engagement tracking.`,
          priceRange: '₹1,50,000 - ₹10,00,000',
          duration: '1-5 Days',
          capacity: '50-5000+ Attendees',
          image: '/events/corporate.jpg',
          gallery: JSON.stringify(['/events/corporate.jpg', '/events/corporate2.jpg', '/events/conference.jpg']),
          features: JSON.stringify([
            'Venue Selection & Setup',
            'Audio-Visual Equipment & Tech Support',
            'Registration & Badge Management',
            'Speaker Coordination & Travel',
            'Live Streaming & Recording',
            'Catering & Refreshment Management',
            'Networking Session Organization',
            'Branding & Signage',
            'Post-Event Analytics & Reports',
            'Virtual/Hybrid Event Options'
          ]),
          ideas: JSON.stringify([
            'Incorporate interactive breakout sessions',
            'Use gamification for audience engagement',
            'Arrange speed networking sessions',
            'Create a dedicated app for the event',
            'Set up innovation showcase corners',
            'Plan surprise keynote speakers'
          ]),
          isFeatured: true,
          status: 'ACTIVE',
        },
      }),
      db.event.create({
        data: {
          title: 'Birthday Bash Extravaganza',
          slug: 'birthday-bash',
          category: 'birthday',
          shortDesc: 'Make every birthday unforgettable with our creative and fun celebration packages.',
          description: `Celebrate another year of life with a spectacular birthday party planned and executed by our expert team. Whether it is a milestone birthday, a kids party, or a surprise celebration, we make every moment special.\n\nOur birthday party packages include theme-based decoration, entertainment, catering, cake design, return gifts, and photography. We offer both indoor and outdoor venue options with customized setups based on your preferences and budget.\n\nFrom balloon art and face painting for kids to elegant dinner parties for adults, our versatile team adapts to any style. We also specialize in surprise birthday planning, ensuring the guest of honor is completely amazed.`,
          priceRange: '₹25,000 - ₹3,00,000',
          duration: '4-8 Hours',
          capacity: '10-500+ Guests',
          image: '/events/birthday.jpg',
          gallery: JSON.stringify(['/events/birthday.jpg', '/events/party.jpg']),
          features: JSON.stringify([
            'Theme-Based Decoration',
            'Custom Cake Design & Ordering',
            'Entertainment (Magic Show, DJ, Games)',
            'Catering & Menu Planning',
            'Return Gift Arrangement',
            'Photography & Videography',
            'Invitation Design',
            'Venue Decoration',
            'Surprise Planning',
            'Birthday Costume & Props'
          ]),
          ideas: JSON.stringify([
            'Choose a trending theme like retro, Bollywood, or superhero',
            'Create a memory wall with photos from different ages',
            'Organize fun group activities and games',
            'Set up a DIY station for personalized party favors',
            'Plan a countdown or surprise element',
            'Hire a caricature artist or photo booth'
          ]),
          isFeatured: true,
          status: 'ACTIVE',
        },
      }),
      db.event.create({
        data: {
          title: 'Professional Webinar Platform',
          slug: 'professional-webinar',
          category: 'webinar',
          shortDesc: 'End-to-end webinar management with professional production quality and audience engagement.',
          description: `Host impactful webinars that engage, educate, and convert your audience. Our professional webinar management service handles everything from technical setup to post-event analytics.\n\nWe provide complete webinar solutions including platform setup, speaker preparation, presentation design, audience engagement tools, and follow-up automation. Our team ensures smooth streaming with backup systems to prevent any technical glitches.\n\nWhether you are hosting a product demo, educational series, thought leadership session, or customer training, we tailor the webinar experience to your specific goals. Our engagement strategies maximize attendance and interaction rates.`,
          priceRange: '₹30,000 - ₹2,00,000',
          duration: '1-4 Hours',
          capacity: '100-10,000+ Virtual Attendees',
          image: '/events/webinar.jpg',
          gallery: JSON.stringify(['/events/webinar.jpg']),
          features: JSON.stringify([
            'Platform Setup & Configuration',
            'Speaker Training & Preparation',
            'Presentation Design & Optimization',
            'Live Streaming with Backup',
            'Audience Q&A Management',
            'Breakout Room Coordination',
            'Recording & Post-Production',
            'Analytics & Attendance Reports',
            'Follow-up Email Automation',
            'Technical Support Throughout'
          ]),
          ideas: JSON.stringify([
            'Use polls and quizzes for audience engagement',
            'Invite industry experts as guest speakers',
            'Offer exclusive downloadable resources',
            'Plan interactive workshops within the webinar',
            'Create a series for continuous engagement',
            'Use storytelling for impactful presentations'
          ]),
          isFeatured: true,
          status: 'ACTIVE',
        },
      }),
      db.event.create({
        data: {
          title: 'Luxury Theme Party',
          slug: 'luxury-party',
          category: 'party',
          shortDesc: 'Epic themed parties that set the standard for unforgettable nightlife experiences.',
          description: `Transform any occasion into an extraordinary celebration with our luxury party planning services. From New Year bashes and cocktail parties to themed galas and festive celebrations, we create experiences that people talk about for years.\n\nOur party planning expertise covers concept development, venue transformation, lighting and sound design, entertainment booking, mixology and catering, and complete guest experience management. We work with top DJs, performers, and decorators to deliver premium entertainment.\n\nEvery party we plan is a masterpiece of creativity and logistics. Whether it is an intimate gathering of 20 or a mega event with thousands, we bring the same level of passion and precision to every detail.`,
          priceRange: '₹50,000 - ₹5,00,000',
          duration: '4-12 Hours',
          capacity: '20-3000+ Guests',
          image: '/events/party.jpg',
          gallery: JSON.stringify(['/events/party.jpg']),
          features: JSON.stringify([
            'Theme Concept Development',
            'Venue Transformation & Decor',
            'Professional Lighting & Sound',
            'DJ & Live Performance Booking',
            'Cocktail Bar & Mixology',
            'Gourmet Catering',
            'Photo & Video Coverage',
            'Security Management',
            'VIP Area Design',
            'Guest Experience Coordination'
          ]),
          ideas: JSON.stringify([
            'Create immersive themed environments (Great Gatsby, Masquerade, etc.)',
            'Set up interactive food and drink stations',
            'Include surprise performances or acts',
            'Use LED walls and projection mapping',
            'Create signature cocktails matching the theme',
            'Plan a grand finale moment'
          ]),
          status: 'ACTIVE',
        },
      }),
      db.event.create({
        data: {
          title: 'Networking Conference Pro',
          slug: 'networking-conference',
          category: 'conference',
          shortDesc: 'Strategic conference planning designed to maximize connections and business opportunities.',
          description: `Unlock the power of meaningful connections with our professionally organized networking conferences. We design events that facilitate genuine business relationships and knowledge exchange.\n\nOur networking event services include structured networking sessions, speaker panels, workshop facilitation, exhibition space management, digital matchmaking, and post-event follow-up systems. We create environments where professionals naturally connect and collaborate.\n\nFrom industry-specific conferences to cross-sector networking events, our strategic approach ensures every attendee gains value. We incorporate the latest networking technologies and format innovations to make your event stand out.`,
          priceRange: '₹75,000 - ₹5,00,000',
          duration: '1-3 Days',
          capacity: '100-2000+ Professionals',
          image: '/events/conference.jpg',
          gallery: JSON.stringify(['/events/conference.jpg']),
          features: JSON.stringify([
            'Structured Networking Sessions',
            'Speaker Panel Organization',
            'Workshop & Breakout Rooms',
            'Exhibition Space Management',
            'Digital Matchmaking Platform',
            'Business Card Exchange System',
            'Catering & Refreshments',
            'Event App Development',
            'Post-Event Follow-up System',
            'Sponsor Management'
          ]),
          ideas: JSON.stringify([
            'Use speed networking rounds for quick introductions',
            'Create topic-specific discussion tables',
            'Organize innovation pitch sessions',
            'Set up collaboration corners',
            'Plan informal networking dinners',
            'Use AI-powered matchmaking for attendees'
          ]),
          status: 'ACTIVE',
        },
      }),
      db.event.create({
        data: {
          title: 'Baby Shower Delights',
          slug: 'baby-shower',
          category: 'babyshower',
          shortDesc: 'Cherish the journey to parenthood with beautifully curated baby shower celebrations.',
          description: `Welcome the newest member of the family with a heartwarming baby shower planned to perfection. Our baby shower services create beautiful, memorable celebrations filled with joy, love, and thoughtful details.\n\nWe handle everything from theme selection and decoration to games, catering, cake, and return gifts. Our packages are customizable for both intimate family gatherings and larger celebrations with friends and colleagues.\n\nOur team specializes in creating warm, Instagram-worthy setups with pastel themes, balloon arrangements, dessert tables, and interactive activities. Every element is designed to make the parents-to-be feel special and celebrated.`,
          priceRange: '₹15,000 - ₹1,50,000',
          duration: '3-6 Hours',
          capacity: '15-200+ Guests',
          image: '/events/babyshower.jpg',
          gallery: JSON.stringify(['/events/babyshower.jpg']),
          features: JSON.stringify([
            'Theme Selection & Decoration',
            'Balloon Art & Floral Arrangements',
            'Cake & Dessert Table Setup',
            'Fun Games & Activities',
            'Catering & Refreshments',
            'Return Gift Curation',
            'Photography',
            'Invitation Design',
            'Favor Bags',
            'Memory Book Creation'
          ]),
          ideas: JSON.stringify([
            'Choose a storybook or animal theme',
            'Set up a wish tree for guests',
            'Create a diaper cake centerpiece',
            'Organize guess-the-baby games',
            'Prepare a time capsule activity',
            'Set up a professional photo booth with baby props'
          ]),
          status: 'ACTIVE',
        },
      }),
      db.event.create({
        data: {
          title: 'Anniversary Celebration',
          slug: 'anniversary-celebration',
          category: 'anniversary',
          shortDesc: 'Celebrate your love story with a romantic and unforgettable anniversary event.',
          description: `Commemorate your journey of love with a beautifully planned anniversary celebration. Whether it is your first anniversary or a golden jubilee, we create romantic, personalized events that celebrate your unique bond.\n\nOur anniversary celebration services include romantic venue decoration, curated dining experiences, surprise element planning, renewal of vows ceremonies, entertainment, and photography. We specialize in both intimate celebrations and grand anniversary parties.\n\nLet us handle every detail while you focus on celebrating your special milestone. From candlelit dinners to dance floors, we create the perfect ambiance for your celebration of love.`,
          priceRange: '₹20,000 - ₹3,00,000',
          duration: '3-8 Hours',
          capacity: '10-500+ Guests',
          image: '/events/anniversary.jpg',
          gallery: JSON.stringify(['/events/anniversary.jpg']),
          features: JSON.stringify([
            'Romantic Venue Decoration',
            'Curated Dining Experience',
            'Surprise Element Planning',
            'Renewal of Vows Ceremony',
            'Music & Entertainment',
            'Professional Photography',
            'Custom Cake Design',
            'Memory Lane Display',
            'Gift Registry Management',
            'Travel & Honeymoon Planning'
          ]),
          ideas: JSON.stringify([
            'Recreate your first date or proposal',
            'Create a timeline of memories display',
            'Plan a surprise video message from loved ones',
            'Organize a couples activity or game',
            'Set up a starry night or fairy light theme',
            'Plan a romantic dance performance'
          ]),
          status: 'ACTIVE',
        },
      }),
      db.event.create({
        data: {
          title: 'Cultural Festival & Celebrations',
          slug: 'cultural-festival',
          category: 'cultural',
          shortDesc: 'Vibrant cultural event management celebrating traditions, art, and community spirit.',
          description: `Celebrate the richness of culture and tradition with our expertly organized cultural events. From festivals and religious ceremonies to art exhibitions and community gatherings, we honor cultural heritage with authenticity and grandeur.\n\nOur cultural event management includes traditional decoration, ritual coordination, cultural performance arrangement, authentic catering, and community engagement activities. We understand the significance of cultural nuances and ensure every event respects and celebrates traditions.\n\nWe work closely with community leaders, cultural organizations, and traditional artists to deliver events that are both authentic and contemporary. Our team handles events of all scales, from neighborhood celebrations to city-wide festivals.`,
          priceRange: '₹50,000 - ₹8,00,000',
          duration: '1-7 Days',
          capacity: '100-10,000+ Attendees',
          image: '/events/cultural.jpg',
          gallery: JSON.stringify(['/events/cultural.jpg']),
          features: JSON.stringify([
            'Traditional Decoration & Setup',
            'Ritual & Ceremony Coordination',
            'Cultural Performance Booking',
            'Authentic Catering Arrangement',
            'Stage & Sound Setup',
            'Art & Craft Exhibition',
            'Community Engagement Activities',
            'Procession & Parade Management',
            'Traditional Attire Guidance',
            'Media & Documentation'
          ]),
          ideas: JSON.stringify([
            'Include traditional art and craft workshops',
            'Organize cultural performances and dances',
            'Set up traditional food courts',
            'Create heritage walk experiences',
            'Plan inter-generational storytelling sessions',
            'Showcase local artisans and performers'
          ]),
          status: 'ACTIVE',
        },
      }),
      db.event.create({
        data: {
          title: 'Product Launch Event',
          slug: 'product-launch',
          category: 'productlaunch',
          shortDesc: 'Create buzz and excitement with our professionally orchestrated product launch events.',
          description: `Make your product launch an event to remember with our comprehensive launch event management. We create experiences that generate media buzz, engage stakeholders, and position your product for success from day one.\n\nOur product launch services include venue selection, stage design, audio-visual production, press conference management, influencer coordination, live demonstration setup, and post-event amplification strategy. We ensure maximum impact and visibility for your brand.\n\nFrom tech gadgets and fashion lines to real estate projects and automotive launches, our experienced team adapts to any industry and product type. We create moments that captivate audiences and drive business results.`,
          priceRange: '₹1,00,000 - ₹10,00,000',
          duration: '3-8 Hours',
          capacity: '50-2000+ Guests',
          image: '/events/productlaunch.jpg',
          gallery: JSON.stringify(['/events/productlaunch.jpg']),
          features: JSON.stringify([
            'Venue Selection & Transformation',
            'Stage Design & Production',
            'Audio-Visual & Lighting',
            'Press Conference Setup',
            'Influencer & Media Management',
            'Live Demo Station Design',
            'Product Display & Experience Zones',
            'Social Media Live Coverage',
            'VIP & Stakeholder Management',
            'Post-Event Content Creation'
          ]),
          ideas: JSON.stringify([
            'Create an immersive product experience zone',
            'Use AR/VR for interactive demonstrations',
            'Invite industry thought leaders as speakers',
            'Plan a social media-worthy reveal moment',
            'Set up a press lounge with exclusive previews',
            'Create shareable branded content stations'
          ]),
          status: 'ACTIVE',
        },
      }),
      db.event.create({
        data: {
          title: 'Graduation Ceremony',
          slug: 'graduation-ceremony',
          category: 'graduation',
          shortDesc: 'Honor academic achievements with a dignified and memorable graduation ceremony.',
          description: `Celebrate academic excellence with a beautifully organized graduation ceremony that honors achievements and creates lasting memories. We manage every aspect of the event with the dignity and grandeur that this milestone deserves.\n\nOur graduation ceremony services include stage setup, processional management, certificate distribution coordination, photography, guest seating arrangements, refreshments, and post-ceremony celebrations. We work with educational institutions to ensure smooth execution.\n\nFrom kindergarten graduations to university convocations, we bring the same level of professionalism and attention to detail. Our team handles events ranging from small departmental ceremonies to large-scale university graduations.`,
          priceRange: '₹50,000 - ₹5,00,000',
          duration: '3-6 Hours',
          capacity: '50-5000+ Attendees',
          image: '/events/graduation.jpg',
          gallery: JSON.stringify(['/events/graduation.jpg']),
          features: JSON.stringify([
            'Stage Setup & Decoration',
            'Processional Management',
            'Certificate & Award Distribution',
            'Professional Photography & Video',
            'Guest Seating Arrangement',
            'Sound System & Microphones',
            'Refreshment & Catering',
            'Academic Regalia Coordination',
            'Post-Ceremony Celebration',
            'Live Streaming for Remote Family'
          ]),
          ideas: JSON.stringify([
            'Create a memory wall with student achievements',
            'Plan an inspiring valedictory speech',
            'Organize a cap-toss photo moment',
            'Set up a congratulatory video message booth',
            'Create personalized graduation souvenirs',
            'Plan a graduates parade or march'
          ]),
          status: 'ACTIVE',
        },
      }),
    ]);

    // Create Bookings
    const booking1 = await db.booking.create({
      data: {
        userId: client1.id,
        eventId: events[0].id,
        eventType: 'Wedding',
        eventDate: '2026-06-15',
        guestCount: '500',
        budget: '5,00,000',
        message: 'Looking for a complete wedding package with traditional decorations and modern amenities.',
        status: 'CONFIRMED',
        totalAmount: '5,00,000',
      },
    });

    const booking2 = await db.booking.create({
      data: {
        userId: client2.id,
        eventId: events[1].id,
        eventType: 'Corporate Conference',
        eventDate: '2026-08-20',
        guestCount: '300',
        budget: '3,50,000',
        message: 'Annual company conference with keynote speakers and breakout sessions.',
        status: 'PENDING',
        totalAmount: '3,50,000',
      },
    });

    const booking3 = await db.booking.create({
      data: {
        userId: client1.id,
        eventId: events[2].id,
        eventType: 'Birthday Party',
        eventDate: '2026-05-10',
        guestCount: '80',
        budget: '75,000',
        message: 'Surprise birthday party for my husband, retro theme preferred.',
        status: 'COMPLETED',
        totalAmount: '75,000',
      },
    });

    // Create Payments
    await db.payment.create({
      data: {
        bookingId: booking1.id,
        amount: '2,50,000',
        method: 'BANK_TRANSFER',
        status: 'COMPLETED',
        transactionId: 'TXN20260401001',
        paidAt: new Date(),
      },
    });

    await db.payment.create({
      data: {
        bookingId: booking3.id,
        amount: '75,000',
        method: 'UPI',
        status: 'COMPLETED',
        transactionId: 'TXN20260315001',
        paidAt: new Date('2026-03-15'),
      },
    });

    // Create Staff Assignments
    await db.staffAssignment.create({
      data: {
        eventId: events[0].id,
        staffId: staff1.id,
        role: 'Lead Coordinator',
        status: 'IN_PROGRESS',
        notes: 'Main coordinator for the wedding event. Handle all vendor communications.',
      },
    });

    await db.staffAssignment.create({
      data: {
        eventId: events[1].id,
        staffId: staff2.id,
        role: 'Event Manager',
        status: 'ASSIGNED',
        notes: 'Coordinate all corporate conference logistics and AV setup.',
      },
    });

    await db.staffAssignment.create({
      data: {
        eventId: events[3].id,
        staffId: staff3.id,
        role: 'Technical Lead',
        status: 'COMPLETED',
        notes: 'Managed the webinar platform and streaming successfully.',
        completedAt: new Date(),
      },
    });

    await db.staffAssignment.create({
      data: {
        eventId: events[0].id,
        staffId: staff2.id,
        role: 'AV & Sound Manager',
        status: 'IN_PROGRESS',
        notes: 'Handle all audio-visual requirements for the ceremony and reception.',
      },
    });

    // Create Testimonials
    await db.testimonial.createMany({
      data: [
        {
          name: 'Sneha & Rahul',
          role: 'Wedding Couple',
          content: 'EventPro made our wedding day absolutely magical! Every detail was perfect, from the stunning mandap decoration to the seamless coordination. Our guests are still talking about how beautiful everything was. Highly recommended for anyone planning their dream wedding!',
          rating: 5,
          avatar: null,
        },
        {
          name: 'Amit Verma',
          role: 'CEO, TechStart India',
          content: 'We hired EventPro for our annual company conference with 500+ attendees, and the execution was flawless. The team handled everything from registration to live streaming with incredible professionalism. Our board was thoroughly impressed!',
          rating: 5,
          avatar: null,
        },
        {
          name: 'Kavitha Nair',
          role: 'HR Director, Innovate Corp',
          content: 'The corporate offsite organized by EventPro exceeded all our expectations. The team building activities, venue selection, and overall management were top-notch. They truly understand corporate event requirements.',
          rating: 4,
          avatar: null,
        },
        {
          name: 'Rohan & Meera',
          role: 'Parents',
          content: 'Our kids birthday party was a huge hit thanks to EventPro! The theme decoration, entertainment, and cake were all amazing. The children had a blast and the parents could actually enjoy the party stress-free.',
          rating: 5,
          avatar: null,
        },
        {
          name: 'Dr. Priya Menon',
          role: 'Marketing Head, EduGlobal',
          content: 'The webinar series managed by EventPro helped us reach thousands of students globally. Their technical setup was impeccable and the engagement tools they provided kept the audience actively participating throughout.',
          rating: 5,
          avatar: null,
        },
        {
          name: 'Suresh & Lakshmi',
          role: 'Silver Jubilee Couple',
          content: 'Our 25th anniversary celebration was everything we dreamed of and more. The romantic setup, the surprise elements, and the attention to detail made it a truly special evening. Thank you EventPro for making it unforgettable!',
          rating: 5,
          avatar: null,
        },
      ],
    });

    // Create Contact Messages
    await db.contactMessage.create({
      data: {
        name: 'Divya Krishnan',
        email: 'divya.k@email.com',
        subject: 'Wedding Planning Inquiry',
        message: 'Hi, I am planning my wedding for December 2026 and would like to know more about your destination wedding packages. Please share the details.',
        userId: null,
      },
    });

    await db.contactMessage.create({
      data: {
        name: 'Arjun Mehta',
        email: 'arjun@test.com',
        subject: 'Conference Booking Update',
        message: 'Could you please share the updated agenda for the August conference? Also, I would like to discuss the AV requirements.',
        userId: client2.id,
      },
    });

    // Create Notifications
    await db.notification.create({
      data: {
        userId: staff1.id,
        title: 'New Wedding Assignment',
        message: 'You have been assigned as Lead Coordinator for the Dream Wedding event on June 15, 2026.',
        type: 'INFO',
      },
    });

    await db.notification.create({
      data: {
        userId: client1.id,
        title: 'Booking Confirmed!',
        message: 'Your wedding event booking for June 15, 2026 has been confirmed. Advance payment of ₹2,50,000 received.',
        type: 'SUCCESS',
      },
    });

    await db.notification.create({
      data: {
        userId: admin.id,
        title: 'New Booking Request',
        message: 'Arjun Mehta has submitted a booking request for Corporate Conference on August 20, 2026.',
        type: 'WARNING',
      },
    });

    return NextResponse.json({ success: true, message: 'Database seeded successfully!' });
  } catch (error: unknown) {
    console.error('Seed error:', error);
    return NextResponse.json({ success: false, message: 'Failed to seed database' }, { status: 500 });
  }
}
