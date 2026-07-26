import { GeneratedConcept } from "../generation/schema";
import { checkComputationVerification } from "./computationVerification";
import { checkEncodingFontSafety } from "./encodingFontSafety";
import { checkStructuralCompleteness } from "./structuralCompleteness";
import { checkSkillClaimTraceability } from "./skillClaimTraceability";
import { CheckResult } from "./types";

export type { CheckResult };

// Runs every deterministic check from docs/07_checks.md, in the order that
// doc lists them. Called automatically on every generated concept, before
// anything is shown, per docs/05_product_spec.md's flow.
export async function runDeterministicChecks(
  concept: GeneratedConcept
): Promise<CheckResult[]> {
  return [
    checkComputationVerification(concept),
    checkEncodingFontSafety(concept),
    checkStructuralCompleteness(concept),
    await checkSkillClaimTraceability(concept),
  ];
}
