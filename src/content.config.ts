import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const noteSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  draft: z.boolean().default(false),
  math: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  toc: z.boolean().default(false),
  footer: z.boolean().default(true),
  emoji: z.string().optional(),
});

const courses = defineCollection({
  loader: glob({ base: './src/content/courses', pattern: '**/*.md' }),
  schema: noteSchema,
});

const skills = defineCollection({
  loader: glob({ base: './src/content/skills', pattern: '**/*.md' }),
  schema: noteSchema,
});

export const collections = { courses, skills };
