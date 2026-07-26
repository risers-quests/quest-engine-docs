import { rgb } from "pdf-lib";
import { VerificationStep } from "../generation/schema";
import { CONTENT_WIDTH, MARGIN, PdfWriter } from "./pdfWriter";
import { wrapText } from "./textWrap";

const BORDER_COLOR = rgb(0.6, 0.6, 0.6);
const HEADER_FILL = rgb(0.92, 0.92, 0.92);
const TEXT_COLOR = rgb(0.15, 0.15, 0.15);

const DESC_COL_WIDTH = CONTENT_WIDTH * 0.5;
const EXPR_COL_WIDTH = CONTENT_WIDTH * 0.3;
const RESULT_COL_WIDTH = CONTENT_WIDTH - DESC_COL_WIDTH - EXPR_COL_WIDTH;

const CELL_PADDING = 5;
const FONT_SIZE = 9;
const LINE_HEIGHT = 11;

// A genuinely drawn diagram - a table of every verification step and its
// claimed result - not described in prose and not an external image
// (docs/04_design.md). A table, not a proportional bar chart: computation
// steps rarely share a comparable scale (a year, a per-capita count, a
// total are all "numbers" but not the same axis), so bar length would
// mislead rather than inform.
export function drawVerificationChart(writer: PdfWriter, steps: VerificationStep[]) {
  if (steps.length === 0) return;

  writer.drawSectionLabel("Verification steps (drawn from the concept's own computation)");
  drawRow(
    writer,
    ["Step", "Expression", "Result"],
    { bold: true, fill: HEADER_FILL }
  );

  for (const step of steps) {
    drawRow(writer, [step.description, step.expression, String(step.claimed_result)], {});
  }

  writer.drawSpacer(6);
}

function drawRow(
  writer: PdfWriter,
  cells: [string, string, string],
  opts: { bold?: boolean; fill?: ReturnType<typeof rgb> }
) {
  const font = opts.bold ? writer.bodyBoldFont : writer.bodyFont;
  const colWidths = [DESC_COL_WIDTH, EXPR_COL_WIDTH, RESULT_COL_WIDTH];
  const colTexts = cells.map((text, i) =>
    wrapText(text, font, FONT_SIZE, colWidths[i] - CELL_PADDING * 2)
  );
  const rowLines = Math.max(...colTexts.map((lines) => lines.length), 1);
  const rowHeight = rowLines * LINE_HEIGHT + CELL_PADDING * 2;

  writer.ensureSpace(rowHeight);
  const rowTop = writer.cursorY;
  const rowBottom = rowTop - rowHeight;

  if (opts.fill) {
    writer.page.drawRectangle({
      x: MARGIN,
      y: rowBottom,
      width: CONTENT_WIDTH,
      height: rowHeight,
      color: opts.fill,
    });
  }

  let x = MARGIN;
  for (let i = 0; i < 3; i++) {
    writer.page.drawRectangle({
      x,
      y: rowBottom,
      width: colWidths[i],
      height: rowHeight,
      borderColor: BORDER_COLOR,
      borderWidth: 0.5,
    });

    let lineY = rowTop - CELL_PADDING - FONT_SIZE;
    for (const line of colTexts[i]) {
      writer.page.drawText(line, {
        x: x + CELL_PADDING,
        y: lineY,
        size: FONT_SIZE,
        font,
        color: TEXT_COLOR,
      });
      lineY -= LINE_HEIGHT;
    }

    x += colWidths[i];
  }

  writer.cursorY = rowBottom;
}
