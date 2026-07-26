import { readFile } from "fs/promises";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "docs");

async function readDoc(filename: string): Promise<string> {
  return readFile(path.join(DOCS_DIR, filename), "utf-8");
}

// 03_system_prompt.md wraps the actual prompt text in doc-maintenance headers
// ("This is the actual text sent to the model...", "## Change process"). Only
// the "## Prompt text" section is meant for the model.
function extractPromptText(doc: string): string {
  const match = doc.match(/## Prompt text\n([\s\S]*?)\n## Change process/);
  if (!match) {
    throw new Error(
      "03_system_prompt.md: could not find a '## Prompt text' section ending in '## Change process'"
    );
  }
  return match[1].trim();
}

// 01_skills_taxonomy.md and 02_ethics.md end with a "## Change process" section
// aimed at whoever edits the doc, not at the model.
function stripChangeProcess(doc: string): string {
  return doc.replace(/\n## Change process[\s\S]*$/, "").trim();
}

// Assembles the system prompt per docs/00_build_brief.md and docs/03_system_prompt.md:
// the prompt text, followed by the taxonomy and ethics docs it refers to as "attached".
export async function loadSystemPrompt(): Promise<string> {
  const [systemPromptDoc, taxonomyDoc, ethicsDoc] = await Promise.all([
    readDoc("03_system_prompt.md"),
    readDoc("01_skills_taxonomy.md"),
    readDoc("02_ethics.md"),
  ]);

  const sections = [
    extractPromptText(systemPromptDoc),
    "# Skill Taxonomy (attached reference)\n\n" + stripChangeProcess(taxonomyDoc),
    "# Ethics & Content Boundaries (attached reference)\n\n" + stripChangeProcess(ethicsDoc),
  ];

  return sections.join("\n\n---\n\n");
}
