import { NextResponse } from 'next/server';
import { getTenantBySlug } from '../../../services/tenant';

export async function GET(req) {
  const slug = req.headers.get('x-tenant-slug') || req.nextUrl.searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  const tenant = await getTenantBySlug(slug);
  
  if (!tenant) {
    return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
  }

  return NextResponse.json(tenant);
}
