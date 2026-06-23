import { json } from '@sveltejs/kit';
import db from '$lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { RequestHandler } from './$types';

const JWT_SECRET = process.env.JWT_SECRET || 'shophub-dev-secret-2025';

export const POST: RequestHandler = async ({ request }) => {
  const { email, password } = await request.json();
  if (!email || !password) return json({ message: 'Email and password are required.' }, { status: 400 });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !bcrypt.compareSync(password, user.password))
    return json({ message: 'Invalid email or password.' }, { status: 401 });

  const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  return json({ user: safeUser, token });
};
