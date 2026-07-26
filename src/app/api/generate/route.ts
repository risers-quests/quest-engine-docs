import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { generateConcepts } from "@/lib/generation/generateConcepts";
import { formatRawOutput } from "@/lib/generation/formatRawOutput";
import { resolveSkillsClaimed } from "@/lib/generation/resolveSkillsClaimed";
import { runDeterministicChecks } from "@/lib/checks";

interface GenerateRequestBody {
  age_band?: string;
  theme?: string;
  difficulty_target?: string | null;
}

export async function POST(request: Request) {
  let body: GenerateRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ageBand = body.age_band?.trim();
  const theme = body.theme?.trim();
  const difficultyTarget = body.difficulty_target?.trim() || null;

  if (!ageBand || !theme) {
    return NextResponse.json(
      { error: "age_band and theme are required" },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    return NextResponse.json(
      { error: `Supabase not configured: ${(err as Error).message}` },
      { status: 500 }
    );
  }

  const { data: requestRow, error: requestError } = await supabase
    .from("requests")
    .insert({ age_band: ageBand, theme, difficulty_target: difficultyTarget })
    .select()
    .single();

  if (requestError || !requestRow) {
    return NextResponse.json(
      { error: `Failed to record request: ${requestError?.message}` },
      { status: 500 }
    );
  }

  let generatedConcepts;
  try {
    generatedConcepts = await generateConcepts({
      ageBand,
      theme,
      difficultyTarget,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: `Generation failed: ${(err as Error).message}`,
        request_id: requestRow.id,
      },
      { status: 502 }
    );
  }

  const concepts = [];
  for (const generated of generatedConcepts) {
    const skillsClaimed = await resolveSkillsClaimed(generated.skills_claimed);
    const rawOutput = formatRawOutput(generated);
    const ethicsFlag =
      generated.ethics_status === "flagged_for_review" ? generated.ethics_reason : null;

    const { data: conceptRow, error: conceptError } = await supabase
      .from("concepts")
      .insert({
        request_id: requestRow.id,
        raw_output: rawOutput,
        skills_claimed: skillsClaimed,
        ethics_flag: ethicsFlag,
        verification_steps: generated.verification_steps,
      })
      .select()
      .single();

    if (conceptError || !conceptRow) {
      return NextResponse.json(
        { error: `Failed to store concept: ${conceptError?.message}` },
        { status: 500 }
      );
    }

    const checkResults = await runDeterministicChecks(generated);
    const { data: checkRows, error: checksError } = await supabase
      .from("checks")
      .insert(
        checkResults.map((result) => ({
          concept_id: conceptRow.id,
          check_type: result.check_type,
          passed: result.passed,
          detail: result.detail,
        }))
      )
      .select();

    if (checksError) {
      return NextResponse.json(
        { error: `Failed to store check results: ${checksError.message}` },
        { status: 500 }
      );
    }

    concepts.push({ ...conceptRow, checks: checkRows });
  }

  return NextResponse.json({ request_id: requestRow.id, concepts });
}
