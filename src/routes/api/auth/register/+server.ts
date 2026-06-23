import { json } from '@sveltejs/kit';
import db from '$lib/db';
import bcrypt from 'bcryptjs';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { full_name, email, password } = await request.json();
  if (!full_name || !email || !password)
    return json({ message: 'All fields are required.' }, { status: 400 });
  if (password.length < 6)
    return json({ message: 'Password must be at least 6 characters.' }, { status: 400 });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return json({ message: 'An account with this email already exists.' }, { status: 409 });

  const hashed = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)').run(email, hashed, full_name);
  return json({ message: 'Account created.', id: result.lastInsertRowid }, { status: 201 });
};
