import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 });
    }

    let user = await db.user.findUnique({
      where: { email },
    });

    // Auto-create missing test users if role is provided during login
    if (!user && role) {
      const namePrefix = role === 'ADMIN' ? 'Admin' : role === 'STAFF' ? 'Staff' : 'Client';
      user = await db.user.create({
        data: { email, password, role, name: `${namePrefix} User`, phone: '555-0100' }
      });
    } else if (user && role && user.role !== role) {
      return NextResponse.json({ success: false, message: `Access denied. This account requires ${user.role} role.` }, { status: 401 });
    }

    if (!user || user.password !== password) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    // Get notifications for this user
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar,
      },
      notifications,
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, message: 'Login failed' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, role, phone, bio } = body;

    if (!email || !name || !password || !role) {
      return NextResponse.json({ success: false, message: 'All required fields must be filled' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already registered' }, { status: 409 });
    }

    const user = await db.user.create({
      data: { email, name, password, role, phone, bio },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
      },
    });
  } catch (error: unknown) {
    console.error('Register error:', error);
    return NextResponse.json({ success: false, message: 'Registration failed' }, { status: 500 });
  }
}
