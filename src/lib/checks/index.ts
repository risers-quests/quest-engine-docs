import { GeneratedConcept } from "../generation/schema";
import { checkComputationVerification } from "./computationVerification";
import { checkEncodingFontSafety } from "./encodingFontSafety";
import { checkStructuralCompleteness } from "./structuralCompleteness";
import { checkSkillClaimTraceability } from "./skillClaimTraceability";
import { CheckResult } from "./types";

export type { CheckResult };
export { checkEncodingFontSafety };

function collectConceptText(concept: GeneratedConcept): string {
  const skillsText = concept.skills_claimed
    .map((claim) => `${claim.sub_skill} ${claim.moment} ${claim.justification}`)
    .join(" ");

  return [
    concept.core_idea,
    concept.why_it_has_depth,
    concept.checkable_task_example,
    concept.calibration_check,
    concept.verification,
    concept.whats_given_vs_withheld,
    skillsText,
    concept.ethics_reason,
  ].join(" ");
}

// Runs every deterministic check from docs/07_checks.md, in the order that
// doc lists them. Called automatically on every generated concept, before
// anything is shown, per docs/05_product_spec.md's flow.
export async function runDeterministicChecks(
  concept: GeneratedConcept
): Promise<CheckResult[]> {
  return [
    checkComputationVerification(concept),
    checkEncodingFontSafety(collectConceptText(concept)),
    checkStructuralCompleteness(concept),
    await checkSkillClaimTraceability(concept),
  ];
}
