import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/about', '/signin', '/patient/tests'],
      disallow: ['/admin/', '/staff/', '/patient/dashboard/', '/patient/billing/'],
    },
    sitemap: 'https://medoraa.com/sitemap.xml',
  };
}
