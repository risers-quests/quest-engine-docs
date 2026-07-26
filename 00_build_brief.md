# Build Brief (read this first)

You are building a standalone web app from scratch. Everything in this `docs/` folder is a
locked decision made by the product owner ("Wizard") across an extended design conversation.
Do not re-litigate scope, re-ask about structure, or propose alternate architectures unless
you hit a genuine technical blocker — the thinking work is done; this is a build task.

## Read order
1. This file
2. `05_product_spec.md` — what the app is, the flow, what v1 means, what v1 excludes
3. `06_data_model.md` — the Supabase schema
4. `01_skills_taxonomy.md`, `02_ethics.md`, `03_system_prompt.md` — these three get loaded
   by the app at runtime and combined into the actual system prompt sent to the model. Do
   not hardcode their content into application code — read them from disk (or from Supabase,
   your choice) at request time, so a doc edit changes behavior without a code change.
5. `07_checks.md` — implement every "deterministic check" as a real function; every
   "judgment check" is a required section in the model's output, not separate code.
6. `04_design.md` — rules the PDF-build step must follow.

## Stack (already decided, do not change without asking)
- Next.js, deployed on Vercel
- Supabase (Postgres) for storage
- Server-side API routes call the Anthropic API directly (model: use the current
  recommended Claude model for API use — check current docs rather than assuming a
  specific version string, as this may have changed)
- No auth/login — single implicit user
- PDF generation: your choice of library, but must satisfy every rule in `04_design.md`
  (self-sizing layout, no hardcoded box heights, drawn-not-described diagrams, print-safe
  color/typography)

## Build order (do not skip ahead)
1. Scaffold the Next.js app, confirm it runs locally
2. Set up the Supabase schema exactly as specified in `06_data_model.md`
3. Build the generation API route: takes {age_band, theme, difficulty_target}, assembles
   the system prompt from the three docs listed above, calls the model, requests 3 concepts,
   parses the structured output per the format in `03_system_prompt.md`
4. Build the deterministic checks from `07_checks.md` as real functions, run automatically
   on every generated concept, store results per `06_data_model.md`'s `checks` table
5. Build the minimal UI: input form -> 3 concepts displayed with check results and any
   ethics flags visibly shown (never hidden, per `02_ethics.md`'s uncertainty rule) ->
   selection -> PDF build trigger -> download link
6. Build the PDF generation step per `04_design.md`
7. Confirm the full flow works end to end with a real request

## Doc loading — read this carefully, it's a real failure mode
The entire design depends on `01_skills_taxonomy.md`, `02_ethics.md`, and `03_system_prompt.md`
being editable AFTER deployment without a code change. This only works if the app actually
reads these files at request time rather than copying their content into hardcoded strings
in the source code. Do not paste doc content into a `.ts`/`.js` file as a string literal —
that silently defeats the whole point, and the failure wouldn't show up until someone edits
a doc later and nothing happens.

Two viable approaches — pick one deliberately, don't default into one by accident:
1. **Bundle the docs as part of the deployed app** (e.g., in a `content/` folder shipped with
   the build) and read them from disk at request time. Note: Vercel's serverless functions
   have a read-only filesystem at runtime for anything not in the deployment bundle itself —
   this works for files that are part of the build, but you cannot write back to them from
   a running function. If this is the chosen approach, editing a doc means editing the file
   and redeploying — confirm that's an acceptable tradeoff, or use approach 2 instead.
2. **Store doc content in Supabase** (a `docs` table, one row per doc, content as text) and
   have the app fetch from there at request time. This makes doc edits truly live with no
   redeploy needed, at the cost of the docs no longer being plain files you can open and edit
   directly — you'd edit them through a small admin view or directly in the Supabase table
   editor.

State which approach you're using in your own build notes, and make sure local dev and the
actual Vercel deployment behave the same way — don't let this silently work differently in
each environment.
Exactly what `05_product_spec.md`'s "What done means for v1" section says. Do not add
features beyond that section without asking first — specifically, do NOT build: a chat/edit
interface, multi-user support, or a cross-request reference-bank comparison. Those are
explicitly deferred, not forgotten.

## If something in these docs is ambiguous or contradicts itself
Ask, rather than guessing and proceeding. These docs went through several rounds of
correction already (see: two doc-reference numbers were swapped and fixed before this
handoff) — a fresh set of eyes catching a real inconsistency is valuable, but assume the
docs are authoritative on anything that isn't a literal contradiction.

## Known open item
Ethics doc (`02_ethics.md`) currently has no unresolved `[NEEDS WIZARD DECISION]` markers —
all were resolved before this handoff. If you find one, stop and surface it; do not default
silently.
