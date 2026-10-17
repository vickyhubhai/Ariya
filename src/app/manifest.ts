import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#05050a",
    theme_color: "#7c5cfc",
    lang: "en",
    categories: ["music", "multimedia", "utilities"],
    icons: [
      { src: "/assets/ariya-logo-64.png", sizes: "64x64", type: "image/png" },
      { src: "/assets/ariya-logo-160.png", sizes: "160x160", type: "image/png" },
      { src: "/assets/ariya-logo-180.png", sizes: "180x180", type: "image/png" },
      { src: "/assets/ariya-logo-240.png", sizes: "240x240", type: "image/png" },
      { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
