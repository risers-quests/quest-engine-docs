import { StoredSkillClaim } from "./generation/resolveSkillsClaimed";
import { VerificationStep } from "./generation/schema";

export interface ConceptCheckResult {
  id: string;
  concept_id: string;
  check_type: string;
  passed: boolean;
  detail: string;
  created_at: string;
}

export interface ConceptRecord {
  id: string;
  request_id: string;
  created_at: string;
  raw_output: string;
  skills_claimed: StoredSkillClaim[];
  ethics_flag: string | null;
  was_chosen: boolean;
  verification_steps: VerificationStep[];
  checks: ConceptCheckResult[];
}

export interface GenerateResponse {
  request_id: string;
  concepts: ConceptRecord[];
}
