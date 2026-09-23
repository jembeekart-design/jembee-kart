import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jembee-kart.vercel.app';

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/shop`, lastModified: new Date() },
    { url: `${baseUrl}/mlm/watch-earn`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },

    // Legal & Policy Pages
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms_conditions`, lastModified: new Date() },
    { url: `${baseUrl}/refund-policy`, lastModified: new Date() },
    { url: `${baseUrl}/shipping`, lastModified: new Date() },
    { url: `${baseUrl}/rewards-policy`, lastModified: new Date() },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date() },
  ];
}
