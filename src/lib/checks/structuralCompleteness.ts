import { GeneratedConcept } from "../generation/schema";
import { CheckResult } from "./types";

const REQUIRED_TEXT_FIELDS: Array<[keyof GeneratedConcept, string]> = [
  ["core_idea", "CORE IDEA"],
  ["why_it_has_depth", "WHY IT HAS DEPTH"],
  ["checkable_task_example", "CHECKABLE TASK EXAMPLE"],
  ["calibration_check", "CALIBRATION CHECK"],
  ["verification", "VERIFICATION"],
  ["whats_given_vs_withheld", "WHAT'S GIVEN VS WITHHELD"],
];

// docs/07_checks.md: "confirm every required output section exists ... a
// missing section fails the check rather than being silently treated as
// empty." The generation API already enforces this via output_config.format,
// but this check exists as real code independent of that guarantee.
export function checkStructuralCompleteness(concept: GeneratedConcept): CheckResult {
  const missing: string[] = [];

  for (const [field, label] of REQUIRED_TEXT_FIELDS) {
    const value = concept[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      missing.push(label);
    }
  }

  if (concept.skills_claimed.length === 0) {
    missing.push("SKILLS CLAIMED");
  }

  if (concept.ethics_status !== "clear" && concept.ethics_status !== "flagged_for_review") {
    missing.push("ETHICS CHECK");
  } else if (
    concept.ethics_status === "flagged_for_review" &&
    concept.ethics_reason.trim().length === 0
  ) {
    missing.push("ETHICS CHECK (flagged for review but missing a reason)");
  }

  if (missing.length > 0) {
    return {
      check_type: "structural_completeness",
      passed: false,
      detail: `Missing or empty required section(s): ${missing.join(", ")}`,
    };
  }

  return {
    check_type: "structural_completeness",
    passed: true,
    detail: "All required output sections are present.",
  };
}
