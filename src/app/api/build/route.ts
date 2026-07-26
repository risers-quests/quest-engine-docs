import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { checkEncodingFontSafety } from "@/lib/checks/encodingFontSafety";
import { buildConceptPdf } from "@/lib/pdf/buildConceptPdf";
import { uploadConceptPdf } from "@/lib/storage";
import { ConceptRecord } from "@/lib/apiTypes";

interface BuildRequestBody {
  concept_id?: string;
}

export async function POST(request: Request) {
  let body: BuildRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const conceptId = body.concept_id?.trim();
  if (!conceptId) {
    return NextResponse.json({ error: "concept_id is required" }, { status: 400 });
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

  const { data: concept, error: conceptError } = await supabase
    .from("concepts")
    .select()
    .eq("id", conceptId)
    .single<ConceptRecord>();

  if (conceptError || !concept) {
    return NextResponse.json(
      { error: `Concept not found: ${conceptError?.message ?? conceptId}` },
      { status: 404 }
    );
  }

  const { data: requestRow, error: requestError } = await supabase
    .from("requests")
    .select()
    .eq("id", concept.request_id)
    .single();

  if (requestError || !requestRow) {
    return NextResponse.json(
      { error: `Request not found for concept: ${requestError?.message}` },
      { status: 404 }
    );
  }

  // docs/04_design.md's pre-presentation check: "Font/encoding check: confirm
  // no unsupported characters were introduced during generation." Re-run
  // right before building, since a broken character here would produce a
  // corrupted PDF, not just a display-time warning.
  const encodingCheck = checkEncodingFontSafety(concept.raw_output);
  if (!encodingCheck.passed) {
    return NextResponse.json(
      { error: `Cannot build PDF: ${encodingCheck.detail}` },
      { status: 422 }
    );
  }

  const { error: chosenError } = await supabase
    .from("concepts")
    .update({ was_chosen: true })
    .eq("id", conceptId);

  if (chosenError) {
    return NextResponse.json(
      { error: `Failed to record selection: ${chosenError.message}` },
      { status: 500 }
    );
  }

  let pdf;
  try {
    pdf = await buildConceptPdf(concept, {
      ageBand: requestRow.age_band,
      theme: requestRow.theme,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `PDF build failed: ${(err as Error).message}` },
      { status: 500 }
    );
  }

  let downloadUrl: string;
  try {
    downloadUrl = await uploadConceptPdf(`${conceptId}.pdf`, pdf.bytes);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  const { data: buildRow, error: buildError } = await supabase
    .from("builds")
    .insert({
      concept_id: conceptId,
      pdf_path: downloadUrl,
      design_doc_version: pdf.designDocVersion,
    })
    .select()
    .single();

  if (buildError || !buildRow) {
    return NextResponse.json(
      { error: `Failed to record build: ${buildError?.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ build_id: buildRow.id, download_url: downloadUrl });
}
