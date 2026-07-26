import { readFile } from "fs/promises";
import path from "path";

const TAXONOMY_PATH = path.join(process.cwd(), "docs", "01_skills_taxonomy.md");

// Non-skill "## " headings in 01_skills_taxonomy.md — bullets under these
// aren't sub-skill definitions.
const NON_CATEGORY_HEADINGS = new Set(["Rule for the engine", "Change process"]);

export interface TaxonomyEntry {
  skill: string; // category, e.g. "Critical thinking"
  subSkill: string; // e.g. "Confound-checking"
}

let cachedEntries: TaxonomyEntry[] | null = null;

export async function loadTaxonomyEntries(): Promise<TaxonomyEntry[]> {
  if (cachedEntries) return cachedEntries;

  const text = await readFile(TAXONOMY_PATH, "utf-8");
  const entries: TaxonomyEntry[] = [];
  let currentCategory: string | null = null;

  for (const line of text.split("\n")) {
    const categoryMatch = line.match(/^## (.+)$/);
    if (categoryMatch) {
      const heading = categoryMatch[1].trim();
      currentCategory = NON_CATEGORY_HEADINGS.has(heading) ? null : heading;
      continue;
    }

    const subSkillMatch = line.match(/^- \*\*(.+?)\*\*/);
    if (subSkillMatch && currentCategory) {
      entries.push({ skill: currentCategory, subSkill: subSkillMatch[1].trim() });
    }
  }

  cachedEntries = entries;
  return entries;
}

export async function findSkillCategory(subSkill: string): Promise<string | null> {
  const entries = await loadTaxonomyEntries();
  const match = entries.find(
    (entry) => entry.subSkill.toLowerCase() === subSkill.toLowerCase()
  );
  return match ? match.skill : null;
}
