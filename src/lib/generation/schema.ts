// Mirrors the "Output format, per concept" list in docs/03_system_prompt.md,
// split into fields so the model's response can be stored as structured data
// (docs/06_data_model.md's skills_claimed/ethics_flag) as well as reconstructed
// as the human-readable raw_output text.

export interface SkillClaim {
  sub_skill: string;
  moment: string;
  justification: string;
}

export interface GeneratedConcept {
  core_idea: string;
  why_it_has_depth: string;
  checkable_task_example: string;
  calibration_check: string;
  verification: string;
  whats_given_vs_withheld: string;
  skills_claimed: SkillClaim[];
  ethics_status: "clear" | "flagged_for_review";
  ethics_reason: string;
}

export interface GeneratedConceptsPayload {
  concepts: GeneratedConcept[];
}

const skillClaimSchema = {
  type: "object",
  properties: {
    sub_skill: {
      type: "string",
      description: "Exact sub-skill name from the skill taxonomy",
    },
    moment: {
      type: "string",
      description: "The specific moment in the concept where the Riser does this",
    },
    justification: {
      type: "string",
      description: "Why the concept fails if this moment is removed",
    },
  },
  required: ["sub_skill", "moment", "justification"],
  additionalProperties: false,
};

const conceptSchema = {
  type: "object",
  properties: {
    core_idea: { type: "string" },
    why_it_has_depth: { type: "string" },
    checkable_task_example: {
      type: "string",
      description: "Includes the no-lookup justification",
    },
    calibration_check: {
      type: "string",
      description: "Feel, hardest inferential leap, fit to age band",
    },
    verification: {
      type: "string",
      description:
        "Full best-case/worst-case path reasoning if applicable, otherwise state plainly that verification does not apply and why",
    },
    whats_given_vs_withheld: { type: "string" },
    skills_claimed: {
      type: "array",
      items: skillClaimSchema,
    },
    ethics_status: {
      type: "string",
      enum: ["clear", "flagged_for_review"],
    },
    ethics_reason: {
      type: "string",
      description:
        "One line of reasoning when ethics_status is flagged_for_review; empty string when clear",
    },
  },
  required: [
    "core_idea",
    "why_it_has_depth",
    "checkable_task_example",
    "calibration_check",
    "verification",
    "whats_given_vs_withheld",
    "skills_claimed",
    "ethics_status",
    "ethics_reason",
  ],
  additionalProperties: false,
};

export const CONCEPT_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    concepts: {
      type: "array",
      items: conceptSchema,
    },
  },
  required: ["concepts"],
  additionalProperties: false,
};
