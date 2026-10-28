import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

// Sheets & Docs: one entry per category, edited in src/data/docs.json.
const docs = defineCollection({
  loader: file("src/data/docs.json", {
    parser: (text) => JSON.parse(text).map((group: { category: string }) => ({ id: group.category, ...group })),
  }),
  schema: z.object({
    category: z.string(),
    items: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        url: z.url(),
      }),
    ),
  }),
});

// Process Guides: one markdown file per guide in src/content/guides/.
// Files starting with "_" (like _template.md) are ignored.
const guides = defineCollection({
  loader: glob({ pattern: ["**/*.md", "!**/_*.md"], base: "src/content/guides" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    updated: z.coerce.date().optional(),
    owner: z.string().optional(),
    sourceUrl: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs, guides };
