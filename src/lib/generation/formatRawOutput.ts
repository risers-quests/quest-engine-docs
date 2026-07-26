import { GeneratedConcept } from "./schema";

// Reconstructs the concept as plain text in the exact section format from
// docs/03_system_prompt.md's "Output format, per concept" list, for storage
// in concepts.raw_output ("full generated concept text, all sections").
export function formatRawOutput(concept: GeneratedConcept): string {
  const skillsClaimedText = concept.skills_claimed
    .map(
      (claim) =>
        `- ${claim.sub_skill} — moment: ${claim.moment} — why load-bearing: ${claim.justification}`
    )
    .join("\n");

  const ethicsCheckText =
    concept.ethics_status === "clear"
      ? "clear"
      : `flagged for review: ${concept.ethics_reason}`;

  return [
    `CORE IDEA\n${concept.core_idea}`,
    `WHY IT HAS DEPTH\n${concept.why_it_has_depth}`,
    `CHECKABLE TASK EXAMPLE\n${concept.checkable_task_example}`,
    `CALIBRATION CHECK\n${concept.calibration_check}`,
    `VERIFICATION\n${concept.verification}`,
    `WHAT'S GIVEN VS WITHHELD\n${concept.whats_given_vs_withheld}`,
    `SKILLS CLAIMED\n${skillsClaimedText}`,
    `ETHICS CHECK\n${ethicsCheckText}`,
  ].join("\n\n");
}
