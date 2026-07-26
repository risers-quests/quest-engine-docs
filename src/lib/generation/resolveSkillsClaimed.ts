import { findSkillCategory } from "@/lib/taxonomy";
import { SkillClaim } from "./schema";

// docs/06_data_model.md's skills_claimed jsonb shape: {skill, sub_skill, moment, justification}.
// "skill" (the taxonomy category) isn't part of the model's structured output — it's
// derived here from 01_skills_taxonomy.md so the model never has to restate the mapping.
export interface StoredSkillClaim {
  skill: string | null;
  sub_skill: string;
  moment: string;
  justification: string;
}

export async function resolveSkillsClaimed(
  claims: SkillClaim[]
): Promise<StoredSkillClaim[]> {
  const resolved: StoredSkillClaim[] = [];
  for (const claim of claims) {
    const skill = await findSkillCategory(claim.sub_skill);
    resolved.push({
      skill,
      sub_skill: claim.sub_skill,
      moment: claim.moment,
      justification: claim.justification,
    });
  }
  return resolved;
}
