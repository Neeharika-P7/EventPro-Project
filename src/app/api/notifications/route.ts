import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
    }

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, notifications });
  } catch (error: unknown) {
    console.error('Notifications error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isRead } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Notification ID required' }, { status: 400 });
    }

    const notification = await db.notification.update({
      where: { id },
      data: { isRead: isRead !== false },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error: unknown) {
    console.error('Notification update error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update notification' }, { status: 500 });
  }
}
