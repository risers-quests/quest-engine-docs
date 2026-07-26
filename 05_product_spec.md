# Product Spec

## What this is
A standalone web app (not a Claude Project, not part of this chat) that generates fully
reasoned learning-experience concepts on request, without requiring a back-and-forth
conversation to develop them — and builds the chosen one into a finished, printable PDF.

## Who uses it
Wizard only. No login, single user, no multi-tenant concerns.

## Why it exists
Right now, every concept requires Wizard and Claude in a live conversation to develop from
scratch. This does not scale past however many concepts can be personally worked through in
real time. This app removes that bottleneck by having the reasoning happen inside the
system itself, producing multiple real options to choose from rather than one thing to
co-develop.

## The flow (v1)
1. Wizard enters: age band, rough theme/subject, optional difficulty target
2. System generates 3 concepts (see 03_system_prompt.md for exact reasoning requirements)
3. Deterministic checks run automatically on all 3, always, before anything is shown
   (see 07_checks.md)
4. Wizard sees all 3 concepts plus their check results, and picks one (or asks for a
   regeneration with adjusted input — no in-app chat/editing in v1)
5. Chosen concept goes through PDF build (see 04_design.md for visual rules)
6. Finished PDF is downloadable

## What v1 explicitly does NOT include
- No conversation/chat interface for refining a concept after generation — regenerate with
  different input instead
- No multi-user accounts or permissions
- No automated "reference bank" comparison against past output yet — checks run per-request
  only in v1; a growing comparison bank is a v2 idea, not a v1 requirement
- No mobile-specific UI considerations beyond basic responsiveness

## What "done" means for v1
Wizard can type a real request, get 3 real concepts with check results, pick one, and receive
a real finished PDF, end to end, without Wizard writing or debugging anything.

## Data stored (see 06_data_model.md for schema detail)
- Every request made
- Every concept generated per request
- Which concept was picked
- Check results for every concept, every time

## Change process
This doc defines v1 scope. If scope needs to change, edit this doc first, then the app
changes to match — not the other way around.
