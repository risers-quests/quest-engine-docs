import { GeneratedConcept } from "../generation/schema";
import { loadTaxonomyEntries } from "../taxonomy";
import { CheckResult } from "./types";

// docs/07_checks.md: "confirm every skill named in SKILLS CLAIMED actually
// exists in 01_skills_taxonomy.md by exact name (catches invented or
// misremembered skill names)." Exact, case-sensitive match - this is the
// check meant to catch drift, unlike the more lenient case-insensitive
// lookup used to display a skill's category.
export async function checkSkillClaimTraceability(
  concept: GeneratedConcept
): Promise<CheckResult> {
  const entries = await loadTaxonomyEntries();
  const knownSubSkills = new Set(entries.map((entry) => entry.subSkill));

  const unknown = concept.skills_claimed
    .map((claim) => claim.sub_skill)
    .filter((subSkill) => !knownSubSkills.has(subSkill));

  if (unknown.length > 0) {
    return {
      check_type: "skill_claim_traceability",
      passed: false,
      detail: `Skill name(s) not found in 01_skills_taxonomy.md by exact match: ${unknown.join(", ")}`,
    };
  }

  return {
    check_type: "skill_claim_traceability",
    passed: true,
    detail: `All ${concept.skills_claimed.length} claimed skill(s) match the taxonomy by exact name.`,
  };
}
