import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "リアルタイム滋賀",
    short_name: "リタイ滋賀",
    description: "滋賀の“今”が、すぐわかる。",
    start_url: "/",
    display: "standalone",
    background_color: "#f7fafb",
    theme_color: "#1a6b8a",
    lang: "ja",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
