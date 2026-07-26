# Checks

Two different kinds of check happen on every concept, every time, with no toggle to skip
either. They must not be blurred together — one is code, one is the model reasoning, and
treating a judgment call as if it were deterministic (or vice versa) is a design error.

## Deterministic checks (real code, not model calls)

These run as actual server-side functions in the app.

- **Computation verification** — if a concept involves numbers/paths (trades, calculations,
  resource math), independently recompute the stated verification path and confirm it matches
  what the model claimed. This is a real re-derivation, not a re-ask of the model.
- **Encoding/font safety** — scan generated text for characters outside the supported font
  set before any PDF build is attempted.
- **Structural completeness** — confirm every required output section exists (CORE IDEA,
  SKILLS CLAIMED, ETHICS CHECK, etc. per 03_system_prompt.md) — a missing section fails the
  check rather than being silently treated as empty.
- **Skill-claim traceability** — confirm every skill named in SKILLS CLAIMED actually exists
  in 01_skills_taxonomy.md by exact name (catches invented or misremembered skill names).

## Judgment checks (the model reasoning, not code)

These are prompted reasoning steps, not deterministic — they can be wrong, and that's known
and accepted, not hidden.

- **Structural distinctness between the 3 concepts** — are they actually different in
  reasoning shape, or a reskin of each other
- **Skill-claim validity** — does the stated "moment" actually require the claimed sub-skill,
  or is the claim aspirational
- **Ethics boundary judgment** — for anything not covered by a hard limit, does this fall
  under a stated default or genuinely need flagging as uncertain

## What happens on failure

- A deterministic check failure blocks that concept from being shown as a clean option — it
  is shown, but visibly marked failed with the specific reason, never silently hidden or
  silently passed.
- A judgment check that flags an ethics uncertainty (or fictional character death, per
  02_ethics.md) does NOT exclude the concept. It is shown, marked "flagged for review:
  [reason]," and Wizard decides. Never silently excluded, never silently passed without the
  visible flag.

## Change process
Add new deterministic checks as new functions; add new judgment checks as new required
sections in 03_system_prompt.md. This doc should always list every check currently active —
if a check exists in code but isn't listed here, that's a doc gap to fix, not a code gap.
