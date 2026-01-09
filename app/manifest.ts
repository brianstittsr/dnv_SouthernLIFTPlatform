import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KDM & Associates | MBDA Federal Procurement Center",
    short_name: "KDM & Associates",
    description:
      "KDM & Associates helps minority-owned businesses win government contracts through strategic teaming, capacity building, and mentorship.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#1e40af",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192x192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/kdm-logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
    categories: ["business", "productivity"],
    lang: "en-US",
    dir: "ltr",
  };
}
