import type { MetadataRoute } from "next";
import { clinic } from "@/content/clinic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${clinic.site}/sitemap.xml`
  };
}
