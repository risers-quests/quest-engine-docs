import { getSupabaseServerClient } from "./supabase";

const PDF_BUCKET = "pdfs";

// Uploads a finished PDF to the public "pdfs" Supabase Storage bucket and
// returns its public download URL, stored as builds.pdf_path
// (docs/06_data_model.md).
export async function uploadConceptPdf(
  fileName: string,
  bytes: Uint8Array
): Promise<string> {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.storage
    .from(PDF_BUCKET)
    .upload(fileName, bytes, { contentType: "application/pdf", upsert: true });

  if (error) {
    throw new Error(`Failed to upload PDF to storage: ${error.message}`);
  }

  const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
