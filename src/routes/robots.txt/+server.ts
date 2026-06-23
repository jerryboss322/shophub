import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: https://shophub.ng/sitemap.xml\n`,
    { headers: { 'Content-Type': 'text/plain' } }
  );
};
