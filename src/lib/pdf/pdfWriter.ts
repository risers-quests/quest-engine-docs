import { PDFDocument, PDFFont, PDFPage, RGB, StandardFonts, rgb } from "pdf-lib";
import { wrapText } from "./textWrap";

export const PAGE_WIDTH = 612; // US Letter, points
export const PAGE_HEIGHT = 792;
export const MARGIN = 54;
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const BODY_COLOR = rgb(0.1, 0.1, 0.1);
const MUTED_COLOR = rgb(0.35, 0.35, 0.35);
const RULE_COLOR = rgb(0.75, 0.75, 0.75);
const HEADER_BAND_COLOR = rgb(0.16, 0.2, 0.27);
const HEADER_BAND_TEXT_COLOR = rgb(1, 1, 1);
const FLAG_BORDER_COLOR = rgb(0.4, 0.3, 0);
const FLAG_TEXT_COLOR = rgb(0.25, 0.18, 0);

export interface ParagraphOptions {
  font?: PDFFont;
  size?: number;
  color?: RGB;
  lineGap?: number;
  maxWidth?: number;
  x?: number;
}

// Writes a self-sizing PDF: every box/section height is measured from its
// own wrapped content and font metrics as it's drawn - nothing is a
// hardcoded constant - and pagination happens per line, so a single
// paragraph can flow across a page break instead of overflowing it.
// docs/04_design.md's visual rules, in code.
export class PdfWriter {
  readonly doc: PDFDocument;
  page: PDFPage;
  cursorY: number;

  readonly headingFont: PDFFont;
  readonly bodyFont: PDFFont;
  readonly bodyBoldFont: PDFFont;

  private constructor(
    doc: PDFDocument,
    headingFont: PDFFont,
    bodyFont: PDFFont,
    bodyBoldFont: PDFFont
  ) {
    this.doc = doc;
    this.headingFont = headingFont;
    this.bodyFont = bodyFont;
    this.bodyBoldFont = bodyBoldFont;
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.cursorY = PAGE_HEIGHT - MARGIN;
  }

  static async create(): Promise<PdfWriter> {
    const doc = await PDFDocument.create();
    // One typeface for headings (serif), one for body (sans) - both
    // Standard-14 fonts, so no embedding/licensing complexity and guaranteed
    // rendering in every PDF viewer at print size.
    const headingFont = await doc.embedFont(StandardFonts.TimesRomanBold);
    const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
    const bodyBoldFont = await doc.embedFont(StandardFonts.HelveticaBold);
    return new PdfWriter(doc, headingFont, bodyFont, bodyBoldFont);
  }

  private newPage() {
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.cursorY = PAGE_HEIGHT - MARGIN;
  }

  ensureSpace(height: number) {
    if (this.cursorY - height < MARGIN) {
      this.newPage();
    }
  }

  // Header band: the only full-width fill in the document, confined to the
  // top of the first page - "no full-page background fills or bleed
  // treatments... header-band-only design" (docs/04_design.md).
  drawHeaderBand(title: string, subtitle: string) {
    const bandHeight = 70;
    this.page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - bandHeight,
      width: PAGE_WIDTH,
      height: bandHeight,
      color: HEADER_BAND_COLOR,
    });
    this.page.drawText(title, {
      x: MARGIN,
      y: PAGE_HEIGHT - 40,
      size: 18,
      font: this.headingFont,
      color: HEADER_BAND_TEXT_COLOR,
    });
    this.page.drawText(subtitle, {
      x: MARGIN,
      y: PAGE_HEIGHT - 58,
      size: 10,
      font: this.bodyFont,
      color: HEADER_BAND_TEXT_COLOR,
    });
    this.cursorY = PAGE_HEIGHT - bandHeight - 24;
  }

  drawSectionLabel(text: string) {
    this.ensureSpace(18);
    this.cursorY -= 14;
    this.page.drawText(text.toUpperCase(), {
      x: MARGIN,
      y: this.cursorY,
      size: 9,
      font: this.bodyBoldFont,
      color: MUTED_COLOR,
    });
    this.cursorY -= 4;
  }

  drawParagraph(text: string, opts: ParagraphOptions = {}) {
    const font = opts.font ?? this.bodyFont;
    const size = opts.size ?? 10.5;
    const color = opts.color ?? BODY_COLOR;
    const lineGap = opts.lineGap ?? 4;
    const maxWidth = opts.maxWidth ?? CONTENT_WIDTH;
    const x = opts.x ?? MARGIN;
    const lineHeight = size + lineGap;

    for (const line of wrapText(text, font, size, maxWidth)) {
      this.ensureSpace(lineHeight);
      this.cursorY -= lineHeight;
      if (line.length > 0) {
        this.page.drawText(line, { x, y: this.cursorY + lineGap, size, font, color });
      }
    }
  }

  drawSpacer(height: number) {
    this.ensureSpace(height);
    this.cursorY -= height;
  }

  drawRule() {
    this.ensureSpace(12);
    this.cursorY -= 6;
    this.page.drawLine({
      start: { x: MARGIN, y: this.cursorY },
      end: { x: PAGE_WIDTH - MARGIN, y: this.cursorY },
      thickness: 0.75,
      color: RULE_COLOR,
    });
    this.cursorY -= 6;
  }

  // A bordered box sized from its own wrapped content. Marked visible via a
  // border and an explicit label - not color alone - so it stays legible
  // printed single-color (docs/04_design.md's B&W rule) and is never
  // silently missable (docs/02_ethics.md's uncertainty rule).
  drawFlagBox(label: string, body: string) {
    const size = 10;
    const lineGap = 4;
    const padding = 10;
    const labelHeight = 14;
    const maxWidth = CONTENT_WIDTH - padding * 2;
    const lines = wrapText(body, this.bodyFont, size, maxWidth);
    const lineHeight = size + lineGap;
    const boxHeight = padding * 2 + labelHeight + lines.length * lineHeight;

    this.ensureSpace(boxHeight + 10);
    const boxTop = this.cursorY;
    const boxBottom = boxTop - boxHeight;

    this.page.drawRectangle({
      x: MARGIN,
      y: boxBottom,
      width: CONTENT_WIDTH,
      height: boxHeight,
      borderColor: FLAG_BORDER_COLOR,
      borderWidth: 1.5,
    });
    this.page.drawText(label, {
      x: MARGIN + padding,
      y: boxTop - padding - 10,
      size: 10,
      font: this.bodyBoldFont,
      color: FLAG_BORDER_COLOR,
    });

    let lineY = boxTop - padding - labelHeight - lineGap;
    for (const line of lines) {
      this.page.drawText(line, {
        x: MARGIN + padding,
        y: lineY,
        size,
        font: this.bodyFont,
        color: FLAG_TEXT_COLOR,
      });
      lineY -= lineHeight;
    }

    this.cursorY = boxBottom - 12;
  }

  async save(): Promise<Uint8Array> {
    return this.doc.save();
  }
}
