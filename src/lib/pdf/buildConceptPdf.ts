import { ConceptRecord } from "../apiTypes";
import { parseSections } from "../generation/parseSections";
import { getDesignDocVersion } from "./designDocVersion";
import { PdfWriter } from "./pdfWriter";
import { drawVerificationChart } from "./verificationChart";

export interface BuildContext {
  ageBand: string;
  theme: string;
}

export interface BuiltPdf {
  bytes: Uint8Array;
  designDocVersion: string;
}

// Assembles one concept into a printable PDF per docs/04_design.md's visual
// rules: header-band-only, self-sizing layout throughout (PdfWriter measures
// every box from its own content), a genuinely drawn diagram when
// verification_steps exist, and B&W-safe marking (borders + labels, never
// color alone) for the ethics flag.
export async function buildConceptPdf(
  concept: ConceptRecord,
  context: BuildContext
): Promise<BuiltPdf> {
  const designDocVersion = await getDesignDocVersion();
  const writer = await PdfWriter.create();

  writer.drawHeaderBand(context.theme, `Age band: ${context.ageBand}`);

  if (concept.ethics_flag) {
    writer.drawFlagBox("FLAGGED FOR REVIEW", concept.ethics_flag);
  }

  for (const section of parseSections(concept.raw_output)) {
    if (section.label === "SKILLS CLAIMED" || section.label === "ETHICS CHECK") {
      // Rendered separately below from structured data (taxonomy category,
      // flag box) rather than duplicated as plain prose here.
      continue;
    }
    if (section.label) {
      writer.drawSectionLabel(section.label);
    }
    writer.drawParagraph(section.body);
  }

  if (concept.verification_steps.length > 0) {
    drawVerificationChart(writer, concept.verification_steps);
  }

  writer.drawSectionLabel("Skills claimed");
  for (const claim of concept.skills_claimed) {
    const category = claim.skill ?? "not found in taxonomy";
    writer.drawParagraph(`${claim.sub_skill} (${category})`, { font: writer.bodyBoldFont, size: 10 });
    writer.drawParagraph(`Moment: ${claim.moment}`, { size: 9.5 });
    writer.drawParagraph(`Why load-bearing: ${claim.justification}`, { size: 9.5 });
    writer.drawSpacer(6);
  }

  writer.drawRule();
  writer.drawParagraph(`Design rules version: ${designDocVersion}`, { size: 8 });

  const bytes = await writer.save();
  return { bytes, designDocVersion };
}
