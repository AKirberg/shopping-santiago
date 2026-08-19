import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const websiteIdPattern =
  /data-website-id="([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})"/i;
const placeholder = "%VITE_UMAMI_WEBSITE_ID%";

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(directory, entry.name);
      if (entry.isDirectory()) return findHtmlFiles(filePath);
      return entry.name.endsWith(".html") ? [filePath] : [];
    }),
  );

  return nested.flat();
}

const htmlFiles = await findHtmlFiles("dist");
const invalidFiles = [];
let websiteId = null;

for (const filePath of htmlFiles) {
  const html = await readFile(filePath, "utf8");
  const match = html.match(websiteIdPattern);

  if (html.includes(placeholder) || !match) {
    invalidFiles.push(filePath);
    continue;
  }

  if (websiteId && websiteId !== match[1]) {
    invalidFiles.push(filePath);
    continue;
  }

  websiteId = match[1];
}

if (!websiteId || invalidFiles.length > 0) {
  console.error(
    `Umami analytics validation failed for: ${invalidFiles.join(", ") || "all generated HTML files"}.`,
  );
  process.exit(1);
}

console.log(`✓ Umami analytics ID validated across ${htmlFiles.length} generated pages`);