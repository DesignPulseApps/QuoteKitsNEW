import { Router } from 'express';

const router = Router();

// Sitemap.xml endpoint
router.get('/sitemap.xml', (req, res) => {
  const baseUrl = 'https://quotekit.ai';
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/features</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/pricing</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/register</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <!-- Calculator Pages -->
  <url>
    <loc>${baseUrl}/wedding-photography-calculator</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/portrait-photography-calculator</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/home-renovation-calculator-new</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/dentist-calculator</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/legal-advisor-calculator</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.send(sitemap);
});

// Robots.txt endpoint
router.get('/robots.txt', (req, res) => {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://quotekit.ai/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1

# Disallow admin areas
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /_next/
Disallow: /admin/

# Allow important pages
Allow: /
Allow: /features
Allow: /pricing
Allow: /login
Allow: /register
Allow: /*-calculator`;

  res.setHeader('Content-Type', 'text/plain');
  res.send(robotsTxt);
});

export default router;