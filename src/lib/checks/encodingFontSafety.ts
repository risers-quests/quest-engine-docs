import { CheckResult } from "./types";

// The "supported font set" per docs/07_checks.md and docs/04_design.md's
// typography rule (one heading typeface, one body typeface, chosen for print
// legibility). Standard Latin text fonts cover this range: basic ASCII plus
// the typographic punctuation ordinary print materials use. Matches the
// WinAnsi encoding pdf-lib's Standard-14 fonts use (src/lib/pdf/pdfWriter.ts)
// so a passing check is actually renderable in the PDF build.
const ALLOWED_CHAR_REGEX =
  /[\x20-\x7E\n\t °±×÷–—‘’“”•…]/;

// docs/07_checks.md: "scan generated text for characters outside the
// supported font set before any PDF build is attempted." Runs at generation
// time (checks/index.ts, over the model's raw fields) and again at PDF-build
// time (docs/04_design.md's pre-presentation check, over the persisted
// raw_output) - same function, different callers.
export function checkEncodingFontSafety(text: string): CheckResult {
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
