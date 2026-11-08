import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://jembee-kart.vercel.app";
  const paths = ["", "/shorts", "/videos", "/explore", "/learn/school", "/contact", "/privacy", "/terms_conditions", "/refund-policy"];
  return paths.map((path) => ({ url: `${baseUrl}${path}`, lastModified: new Date() }));
}
