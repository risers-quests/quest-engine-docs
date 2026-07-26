// Mirrors the "Output format, per concept" list in docs/03_system_prompt.md,
// split into fields so the model's response can be stored as structured data
// (docs/06_data_model.md's skills_claimed/ethics_flag) as well as reconstructed
// as the human-readable raw_output text.

export interface SkillClaim {
  sub_skill: string;
  moment: string;
  justification: string;
}

// A single arithmetic step backing the prose `verification` field, so
// docs/07_checks.md's "computation verification" check can independently
// re-derive it in code instead of re-asking the model.
export interface VerificationStep {
  description: string;
  expression: string;
  claimed_result: number;
}

export interface GeneratedConcept {
  core_idea: string;
  why_it_has_depth: string;
  checkable_task_example: string;
  calibration_check: string;
  verification: string;
  verification_steps: VerificationStep[];
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
    verification_steps: {
      type: "array",
      description:
        "If the concept involves numbers/paths (trades, calculations, resource math), list each computation as a re-derivable arithmetic step matching the reasoning in `verification`. Use only +, -, *, /, parentheses, and decimal numbers in `expression` - no variables. Leave this an empty array when the concept involves no computation.",
      items: {
        type: "object",
        properties: {
          description: {
            type: "string",
            description: "What this step computes, in plain language",
          },
          expression: {
            type: "string",
            description: "A literal arithmetic expression, e.g. \"12 * 3 + 7\"",
          },
          claimed_result: {
            type: "number",
            description: "The numeric result the concept's reasoning claims this expression produces",
          },
        },
        required: ["description", "expression", "claimed_result"],
        additionalProperties: false,
      },
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
    "verification_steps",
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
