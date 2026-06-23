import { json } from '@sveltejs/kit';
import db from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
  const category = url.searchParams.get('category');
  const q        = url.searchParams.get('q');
  const sort     = url.searchParams.get('sort') || 'newest';

  let query = 'SELECT * FROM products WHERE 1=1';
  const params: any[] = [];

  if (category) { query += ' AND category = ?'; params.push(category); }
  if (q)        { query += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }

  query += sort === 'price-asc'  ? ' ORDER BY price ASC'
         : sort === 'price-desc' ? ' ORDER BY price DESC'
         :                         ' ORDER BY id DESC';

  const products = db.prepare(query).all(...params);
  return json(products, { headers: { 'Cache-Control': 'public, max-age=60' } });
};
