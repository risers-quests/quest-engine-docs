import { StoredSkillClaim } from "./generation/resolveSkillsClaimed";

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
  checks: ConceptCheckResult[];
}

export interface GenerateResponse {
  request_id: string;
  concepts: ConceptRecord[];
}
