import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.owheropicker.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://www.owheropicker.com/squad",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://www.owheropicker.com/about",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...["privacy", "terms"].map((page) => ({
      url: `https://www.owheropicker.com/${page}`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.1,
    })),
  ];
}
