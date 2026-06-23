import { json } from '@sveltejs/kit';
import db from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
  const q = url.searchParams.get('q') ?? '';
  if (!q) return json([]);
  const results = db.prepare(
    "SELECT id, name, category, price, image_url FROM products WHERE name LIKE ? OR description LIKE ? LIMIT 8"
  ).all(`%${q}%`, `%${q}%`);
  return json(results);
};
