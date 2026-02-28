import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

function normalizeRole(role) {
  // ajusta aquí si en tu BD hay otros nombres
  // objetivo final: SUPER_ADMIN | PROJECT_OWNER | USER
  if (!role) return 'USER';

  const r = String(role).toUpperCase();

  if (r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (r === 'RESTAURANT_OWNER') return 'PROJECT_OWNER';
  if (r === 'USER') return 'USER';

  // mapeos típicos
  if (r === 'ADMIN') return 'SUPER_ADMIN';
  if (r === 'OWNER') return 'PROJECT_OWNER';
  if (r === 'RESTAURANT') return 'PROJECT_OWNER';

  // fallback
  return 'USER';
}

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return NextResponse.json({ error: 'JWT_SECRET no configurado' }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const role = normalizeRole(user.role);

    // sacamos el restaurante del usuario (si es owner). tu public-settings usa restaurant.userId => lo aprovechamos
    let restaurantId = null;
    let restaurantSlug = null;

    try {
      const r = await prisma.restaurant.findFirst({
        where: { userId: user.id },
        select: { id: true, slug: true },
      });
      if (r) {
        restaurantId = r.id;
        restaurantSlug = r.slug;
      }
    } catch (e) {
      // si falla esta parte no rompemos el login
      console.warn('Could not resolve restaurant for user:', user.id);
    }

    const token = jwt.sign(
      { userId: user.id, role, restaurantId, restaurantSlug },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({
      success: true,
      role,
      restaurantSlug,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error servidor' }, { status: 500 });
  }
}
