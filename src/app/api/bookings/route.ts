import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const bookings = await db.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        event: { select: { id: true, title: true, category: true, image: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error: unknown) {
    console.error('Bookings fetch error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventId, eventType, eventDate, guestCount, budget, message } = body;

    if (!userId || !eventId) {
      return NextResponse.json({ success: false, message: 'User ID and Event ID are required' }, { status: 400 });
    }

    const event = await db.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    const booking = await db.booking.create({
      data: {
        userId, eventId, eventType: eventType || event.category,
        eventDate, guestCount, budget, message,
        totalAmount: budget,
      },
    });

    // Create notification for admin
    const admins = await db.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          title: 'New Booking Request',
          message: `New booking request for ${event.title} from user.`,
          type: 'WARNING',
        },
      });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: unknown) {
    console.error('Booking create error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Booking ID required' }, { status: 400 });
    }

    const booking = await db.booking.update({
      where: { id },
      data: { status },
    });

    // Notify client of status change
    await db.notification.create({
      data: {
        userId: booking.userId,
        title: 'Booking Update',
        message: `Your booking for has been ${status.toLowerCase()}.`,
        type: status === 'CONFIRMED' ? 'SUCCESS' : status === 'CANCELLED' ? 'WARNING' : 'INFO',
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error: unknown) {
    console.error('Booking update error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update booking' }, { status: 500 });
  }
}
