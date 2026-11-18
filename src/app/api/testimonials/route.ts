import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, testimonials });
  } catch (error: unknown) {
    console.error('Testimonials error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch testimonials' }, { status: 500 });
  }
}
