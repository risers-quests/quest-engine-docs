import { GeneratedConcept } from "../generation/schema";
import { CheckResult } from "./types";

// The "supported font set" per docs/07_checks.md and docs/04_design.md's
// typography rule (one heading typeface, one body typeface, chosen for print
// legibility). Standard Latin text fonts cover this range: basic ASCII plus
// the typographic punctuation ordinary print materials use. The actual PDF
// typefaces are chosen in build order step 6 - keep this set in sync with
// whatever is chosen there.
const ALLOWED_CHAR_REGEX =
  /[\x20-\x7E\n\t °±×÷–—‘’“”•…]/;

function collectText(concept: GeneratedConcept): string {
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

// docs/07_checks.md: "scan generated text for characters outside the
// supported font set before any PDF build is attempted."
export function checkEncodingFontSafety(concept: GeneratedConcept): CheckResult {
  const text = collectText(concept);
  const offending = new Set<string>();

  for (const char of text) {
    if (!ALLOWED_CHAR_REGEX.test(char)) {
      offending.add(char);
    }
  }

  if (offending.size > 0) {
    const detail = [...offending]
      .map(
        (char) =>
          `"${char}" (U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")})`
      )
      .join(", ");
    return {
      check_type: "encoding_font_safety",
      passed: false,
      detail: `Found character(s) outside the supported font set: ${detail}`,
    };
  }

  return {
    check_type: "encoding_font_safety",
    passed: true,
    detail: "All generated text uses only supported characters.",
  };
}
