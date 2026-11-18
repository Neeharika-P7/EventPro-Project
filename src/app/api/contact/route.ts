import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const messages = await db.contactMessage.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, messages });
  } catch (error: unknown) {
    console.error('Contact messages error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, userId } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    const contactMessage = await db.contactMessage.create({
      data: { name, email, subject, message, userId },
    });

    return NextResponse.json({ success: true, contactMessage });
  } catch (error: unknown) {
    console.error('Contact message create error:', error);
    return NextResponse.json({ success: false, message: 'Failed to send message' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isRead } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Message ID required' }, { status: 400 });
    }

    const contactMessage = await db.contactMessage.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json({ success: true, contactMessage });
  } catch (error: unknown) {
    console.error('Contact update error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update message' }, { status: 500 });
  }
}
