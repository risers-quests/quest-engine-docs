#!/usr/bin/env node
// Exercises docs/05_product_spec.md's "done" criteria end to end against a
// running instance of the app: real request -> 3 real concepts with check
// results -> pick one -> a real, downloadable PDF. Requires the server to
// already be running (npm run dev, or a deployed URL) with SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY, and ANTHROPIC_API_KEY actually configured -
// this script doesn't set those up, it just drives the HTTP flow and
// reports pass/fail. Build order step 7 of docs/00_build_brief.md.
//
// Usage: node scripts/smoke-test.mjs
//        SMOKE_TEST_BASE_URL=https://your-deploy.vercel.app node scripts/smoke-test.mjs

const baseUrl = process.env.SMOKE_TEST_BASE_URL ?? "http://localhost:3000";

function fail(message, data) {
  console.error(`FAIL: ${message}`);
  if (data !== undefined) console.error(data);
  process.exit(1);
}

async function main() {
  console.log(`Smoke test against ${baseUrl}\n`);

  console.log("Step 1: POST /api/generate ...");
  const generateRes = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      age_band: "10-12",
      theme: "tree rings and fire history",
      difficulty_target: null,
    }),
  });
  const generateData = await generateRes.json().catch(() => null);

  if (!generateRes.ok) {
    fail(`/api/generate returned HTTP ${generateRes.status}`, generateData);
  }

  const { request_id: requestId, concepts } = generateData;
  if (!Array.isArray(concepts) || concepts.length !== 3) {
    fail(`expected 3 concepts, got ${concepts?.length}`, generateData);
  }

  console.log(`OK: request ${requestId} produced ${concepts.length} concepts\n`);

  for (const [i, concept] of concepts.entries()) {
    const failedChecks = concept.checks.filter((c) => !c.passed);
    console.log(
      `  Concept ${i + 1} (${concept.id}): ${concept.checks.length} checks, ` +
        `${failedChecks.length} failed` +
        (concept.ethics_flag ? ", ETHICS FLAGGED" : "")
    );
    for (const check of failedChecks) {
      console.log(`    - [${check.check_type}] ${check.detail}`);
    }
    if (concept.ethics_flag) {
      console.log(`    - ethics_flag: ${concept.ethics_flag}`);
    }
  }

  const chosen = concepts[0];
  console.log(`\nStep 2: POST /api/build for concept ${chosen.id} ...`);

  const buildRes = await fetch(`${baseUrl}/api/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ concept_id: chosen.id }),
  });
  const buildData = await buildRes.json().catch(() => null);

  if (!buildRes.ok) {
    fail(`/api/build returned HTTP ${buildRes.status}`, buildData);
  }

  console.log(`OK: build ${buildData.build_id}`);
  console.log(`Download URL: ${buildData.download_url}\n`);

  console.log("Step 3: fetching the download URL and checking it's a real PDF ...");
  const pdfRes = await fetch(buildData.download_url);
  if (!pdfRes.ok) {
    fail(`download URL returned HTTP ${pdfRes.status}`);
  }

  const buffer = Buffer.from(await pdfRes.arrayBuffer());
  const contentType = pdfRes.headers.get("content-type");
  console.log(`OK: downloaded ${buffer.length} bytes, content-type ${contentType}`);

  if (!buffer.subarray(0, 5).toString("ascii").startsWith("%PDF")) {
    fail("downloaded file does not start with a %PDF header - not a real PDF");
  }

  console.log(
    "\nAll steps passed - full flow works end to end with a real request " +
      "(docs/05_product_spec.md's 'what done means for v1')."
  );
}

main().catch((err) => fail(err.stack ?? String(err)));
