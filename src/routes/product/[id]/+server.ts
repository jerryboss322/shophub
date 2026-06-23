import { json, error } from '@sveltejs/kit';
import db from '$lib/db';

export async function GET({ params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) throw error(400, 'Invalid ID');
    
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    
    if (!product) throw error(404, 'Product not found');
    
    return json(product);
  } catch (e) {
    console.error('Product fetch error:', e);
    throw error(500, 'Failed to load product');
  }
}
