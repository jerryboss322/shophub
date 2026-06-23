import { json, error } from '@sveltejs/kit';
import db from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(params.id));
  if (!product) throw error(404, 'Product not found');
  return json(product);
};
