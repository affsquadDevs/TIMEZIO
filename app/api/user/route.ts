import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const uid = request.cookies.get('uid')?.value;

  if (!uid) {
    return NextResponse.json({ connected: false }, { status: 200 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: {
        id: true,
        email: true,
        name: true,
        refreshToken: true,
      },
    });

    if (!user) {
      return NextResponse.json({ connected: false }, { status: 200 });
    }

    return NextResponse.json({
      connected: !!user.refreshToken,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error('Get user failed', error);
    return NextResponse.json({ connected: false }, { status: 200 });
  }
}
