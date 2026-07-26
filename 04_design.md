# Design Doc

This governs how a chosen concept becomes a finished, printable artifact. It is separate from
concept-generation on purpose: a concept can be excellent and still be built badly, and this
is the layer that stops that from happening silently.

## Visual rules (fixed, applied to every build regardless of content)
- No full-page background fills or bleed treatments — header-band-only design, for
  print-friendliness and toner cost
- Layout must be self-sizing: box/section heights are calculated from actual content length
  and font metrics at build time, never hardcoded to an assumed length
- Any reference diagram (a cross-section, a map, a data chart) is drawn directly in the build
  step, not described in text and left to imagination, and not sourced as an external image
- Colour keys must remain distinguishable if printed in black-and-white (use pattern/shape
  differences, not colour alone, to distinguish categories)
- Typography: one typeface for headings, one for body, chosen for legibility at print size,
  not for decorative effect
- Recording/data tables: first row is always a single worked example unrelated to the actual
  content, so a Riser sees the expected format before attempting their own row

## Legibility and accessibility
- Every page must be legible if printed single-color
- Text density per page must be checked against the target age band's realistic reading
  stamina — dense walls of text are a design failure even if the content is correct
- Any physical/tactile activity (cutting, folding, token placement) must be described with
  literal step-by-step instructions, not assumed knowledge of the activity type

## Pre-presentation check (before a build is shown to Wizard)
- Every page visually inspected (not just text-layer extracted) before presenting
- Bottom rows/edges of tables and boxes specifically checked for overflow or clipping
- Font/encoding check: confirm no unsupported characters were introduced during generation

## Change process
Edit this file directly to change visual/production rules. The PDF-build step reads this file
at build time — no code change required for a rule update to take effect, provided the change
doesn't require new drawing logic (e.g., a genuinely new diagram type would need actual new
code, not just a rule change).
