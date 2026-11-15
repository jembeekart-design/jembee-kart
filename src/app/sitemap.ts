import type { MetadataRoute } from "next";

const baseUrl = "https://jembeeplay.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/shorts",
    "/videos",
    "/explore",
    "/learn/school",
    "/contact",
    "/privacy",
    "/terms_conditions",
    "/refund-policy",
  ];

  return paths.map((path) => ({
    url: new URL(path, baseUrl).toString(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
