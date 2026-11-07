import { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://jembee-kart.vercel.app").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/about`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${siteUrl}/terms_conditions`, lastModified, changeFrequency: "yearly", priority: 0.4 },
  ];
}
