import { json } from '@sveltejs/kit';
import db from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
  const users = db.prepare('SELECT id, email, full_name, phone, is_admin, created_at FROM users ORDER BY created_at DESC').all();
  return json(users);
};
