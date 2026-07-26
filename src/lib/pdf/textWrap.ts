import { PDFFont } from "pdf-lib";

// Word-wraps text into lines that fit maxWidth, measured with the font's own
// glyph metrics (font.widthOfTextAtSize) - not an estimate. This is what lets
// every box/paragraph height downstream be computed from actual content and
// font metrics rather than a hardcoded constant (docs/04_design.md).
export function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    if (paragraph.trim().length === 0) {
      lines.push("");
      continue;
    }

    let currentLine = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        currentLine = candidate;
        continue;
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        currentLine = word;
        continue;
      }

      // A single word longer than the column - hard-break by character
      // rather than overflow the line.
      let chunk = "";
      for (const char of word) {
        const candidateChunk = chunk + char;
        if (font.widthOfTextAtSize(candidateChunk, size) <= maxWidth) {
          chunk = candidateChunk;
        } else {
          if (chunk) lines.push(chunk);
          chunk = char;
        }
      }
      currentLine = chunk;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines;
}
