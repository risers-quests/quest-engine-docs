export interface RawOutputSection {
  label: string;
  body: string;
}

// concepts.raw_output is "LABEL\nbody" blocks joined by blank lines
// (src/lib/generation/formatRawOutput.ts). This reverses that, for the UI
// and the PDF builder to lay the stored text back out without needing each
// section stored as its own column.
export function parseSections(rawOutput: string): RawOutputSection[] {
  return rawOutput.split("\n\n").map((block) => {
    const newlineIndex = block.indexOf("\n");
    if (newlineIndex === -1) {
      return { label: "", body: block };
    }
    return { label: block.slice(0, newlineIndex), body: block.slice(newlineIndex + 1) };
  });
}
