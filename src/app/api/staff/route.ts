import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');

    const assignments = await db.staffAssignment.findMany({
      where: staffId ? { staffId } : {},
      include: {
        event: { select: { id: true, title: true, category: true, image: true } },
        staff: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { assignedAt: 'desc' },
    });

    const staffMembers = await db.user.findMany({
      where: { role: 'STAFF' },
      select: { id: true, name: true, email: true, phone: true },
    });

    return NextResponse.json({ success: true, assignments, staffMembers });
  } catch (error: unknown) {
    console.error('Staff assignments error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, staffId, role, notes } = body;

    if (!eventId || !staffId) {
      return NextResponse.json({ success: false, message: 'Event ID and Staff ID required' }, { status: 400 });
    }

    const assignment = await db.staffAssignment.create({
      data: { eventId, staffId, role, notes },
    });

    // Notify staff member
    await db.notification.create({
      data: {
        userId: staffId,
        title: 'New Assignment',
        message: `You have been assigned to a new event as ${role || 'team member'}.`,
        type: 'INFO',
      },
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: unknown) {
    console.error('Staff assignment create error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create assignment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Assignment ID required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;
    if (status === 'COMPLETED') updateData.completedAt = new Date();

    const assignment = await db.staffAssignment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error: unknown) {
    console.error('Staff assignment update error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update assignment' }, { status: 500 });
  }
}
