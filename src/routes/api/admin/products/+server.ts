import { json } from '@sveltejs/kit';
import db from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
  return json(db.prepare('SELECT * FROM products ORDER BY id DESC').all());
};

export const POST: RequestHandler = async ({ request }) => {
  const { name, description, price, category, image_url, stock } = await request.json();
  const result = db.prepare('INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?,?,?,?,?,?)')
    .run(name, description, Number(price), category, image_url, Number(stock) || 10);
  return json({ id: result.lastInsertRowid }, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
  const { id, name, description, price, category, image_url, stock } = await request.json();
  db.prepare('UPDATE products SET name=?, description=?, price=?, category=?, image_url=?, stock=? WHERE id=?')
    .run(name, description, Number(price), category, image_url, Number(stock), Number(id));
  return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ request }) => {
  const { id } = await request.json();
  db.prepare('DELETE FROM products WHERE id = ?').run(Number(id));
  return json({ ok: true });
};
