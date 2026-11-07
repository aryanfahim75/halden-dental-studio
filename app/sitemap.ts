import type { MetadataRoute } from "next";
import { clinic } from "@/content/clinic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = clinic.site;
  const routes = ["", "/treatments", "/doctors", "/contact", "/book", "/privacy", "/terms"];
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date()
  }));
}
