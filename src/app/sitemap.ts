import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { listings } from "@/lib/schema";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://nivasa.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/how-it-works",
    "/explore",
    "/rooms",
    "/pricing",
    "/safety",
    "/about",
    "/faq",
    "/contact",
    "/privacy",
    "/terms",
    "/login",
    "/signup",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: (path === "" ? "daily" : "weekly") as "daily" | "weekly",
    priority: path === "" ? 1 : path === "/rooms" || path === "/explore" ? 0.9 : 0.6,
  }));

  let roomRoutes: MetadataRoute.Sitemap = [];
  try {
    const rows = await db
      .select({ id: listings.id, updatedAt: listings.updatedAt })
      .from(listings)
      .where(eq(listings.status, "active"))
      .limit(500);
    roomRoutes = rows.map((row) => ({
      url: `${baseUrl}/rooms/${row.id}`,
      lastModified: row.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    roomRoutes = [];
  }

  return [...staticRoutes, ...roomRoutes];
}
