import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');
    const featured = searchParams.get('featured');

    if (slug) {
      const event = await db.event.findUnique({ where: { slug } });
      if (!event) {
        return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, event });
    }

    const where: Record<string, unknown> = { status: 'ACTIVE' };
    if (category) where.category = category;
    if (featured === 'true') where.isFeatured = true;

    const events = await db.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, events });
  } catch (error: unknown) {
    console.error('Events fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, description, shortDesc, category, priceRange, duration, capacity, image, gallery, features, ideas, isFeatured } = body;

    const event = await db.event.create({
      data: {
        title, slug, description, shortDesc, category, priceRange, duration, capacity,
        image, gallery: gallery ? JSON.stringify(gallery) : null,
        features: features ? JSON.stringify(features) : null,
        ideas: ideas ? JSON.stringify(ideas) : null,
        isFeatured: isFeatured || false,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    console.error('Event create error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Event ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === 'gallery' || key === 'features' || key === 'ideas') {
        updateData[key] = value ? JSON.stringify(value) : null;
      } else {
        updateData[key] = value;
      }
    }

    const event = await db.event.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, event });
  } catch (error: unknown) {
    console.error('Event update error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Event ID required' }, { status: 400 });
    }

    await db.event.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error: unknown) {
    console.error('Event delete error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete event' }, { status: 500 });
  }
}
