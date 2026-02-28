import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const existing = await prisma.waitlistEmail.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: 'Already on the list 🔥', alreadyExists: true }, { status: 200 });
    }

    await prisma.waitlistEmail.create({ data: { email } });

    return NextResponse.json({ message: "You're on the list! 🔥" }, { status: 201 });
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
