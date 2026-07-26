import { GeneratedConcept } from "../generation/schema";
import { evaluateArithmetic } from "./safeArithmetic";
import { CheckResult } from "./types";

const FLOAT_TOLERANCE = 1e-6;

// docs/07_checks.md: "if a concept involves numbers/paths ... independently
// recompute the stated verification path and confirm it matches what the
// model claimed. This is a real re-derivation, not a re-ask of the model."
export function checkComputationVerification(concept: GeneratedConcept): CheckResult {
  const steps = concept.verification_steps;

  if (steps.length === 0) {
    return {
      check_type: "computation_verification",
      passed: true,
      detail: "Not applicable - concept has no verification_steps (no computation to re-derive).",
    };
  }

  const mismatches: string[] = [];
  for (const step of steps) {
    let evaluated: number;
    try {
      evaluated = evaluateArithmetic(step.expression);
    } catch (err) {
      mismatches.push(
        `"${step.description}": could not evaluate expression "${step.expression}" (${(err as Error).message})`
      );
      continue;
    }
    if (Math.abs(evaluated - step.claimed_result) > FLOAT_TOLERANCE) {
      mismatches.push(
        `"${step.description}": expression "${step.expression}" evaluates to ${evaluated}, but the concept claims ${step.claimed_result}`
      );
    }
  }

  if (mismatches.length > 0) {
    return {
      check_type: "computation_verification",
      passed: false,
      detail: mismatches.join("; "),
    };
  }

  return {
    check_type: "computation_verification",
    passed: true,
    detail: `Independently recomputed ${steps.length} verification step(s); all matched the concept's claims.`,
  };
}
