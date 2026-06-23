import jwt from 'jsonwebtoken';
import type { RequestEvent } from '@sveltejs/kit';

const JWT_SECRET = process.env.JWT_SECRET || 'shophub-dev-secret-2025';

export function requireAdmin(event: RequestEvent): { id: number; email: string; is_admin: boolean } | null {
  const auth  = event.request.headers.get('Authorization') ?? '';
  const token = auth.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.is_admin ? decoded : null;
  } catch {
    return null;
  }
}
