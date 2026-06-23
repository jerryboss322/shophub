import { json } from '@sveltejs/kit';
import db from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
  return json(db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all());
};

export const PUT: RequestHandler = async ({ request }) => {
  const { id, status } = await request.json();
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, Number(id));
  return json({ ok: true });
};
