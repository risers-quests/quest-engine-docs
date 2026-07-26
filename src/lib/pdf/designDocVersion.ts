import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";

const DESIGN_DOC_PATH = path.join(process.cwd(), "docs", "04_design.md");

// docs/06_data_model.md: builds.design_doc_version - "hash/version of
// 04_design.md at build time, for traceability" - so an old build stays
// traceable to the rules active when it was made, even if the doc changes.
export async function getDesignDocVersion(): Promise<string> {
  const content = await readFile(DESIGN_DOC_PATH, "utf-8");
  const hash = createHash("sha256").update(content).digest("hex");
  return hash.slice(0, 12);
}
