import type { RequestHandler } from './$types';
import db from '$lib/db';

export const GET: RequestHandler = () => {
  const products = db.prepare('SELECT id, created_at FROM products').all() as any[];
  const today    = new Date().toISOString().split('T')[0];

  const staticPages = ['', '/catalog', '/about', '/login', '/register'];
  const productPages = products.map(p =>
    `  <url>\n    <loc>https://shophub.ng/product/${p.id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>\n    <loc>https://shophub.ng${p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${p === '' ? '1.0' : '0.7'}</priority>\n  </url>`).join('\n')}
${productPages.join('\n')}
</urlset>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
