import { readFileSync, writeFileSync } from "fs";

const snippets = JSON.parse(readFileSync("src/data/snippets.json", "utf-8"));
const baseUrl = "https://revis.memzlab.com";
const today = new Date().toISOString().split("T")[0];

const urls = [
  { url: baseUrl, priority: "1.0" },
  { url: `${baseUrl}/snippets`, priority: "0.9" },
  ...snippets.map((s) => ({
    url: `${baseUrl}/snippets/${s.slug}`,
    priority: "0.8",
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ url, priority }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

writeFileSync("public/sitemap.xml", xml);
console.log(`✓ sitemap.xml generated (${urls.length} URLs)`);