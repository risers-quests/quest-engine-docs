// check_type names for docs/06_data_model.md's checks table. 06_data_model.md's
// example names ("computation_verification", "encoding_safety", "font_safety")
// are illustrative, not binding - docs/07_checks.md is the authoritative,
// self-declared complete list of active checks, and it defines encoding/font
// safety as a single combined check, not two.
export interface CheckResult {
  check_type: string;
  passed: boolean;
  detail: string;
}
