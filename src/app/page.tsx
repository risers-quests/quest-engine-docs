"use client";

import { useState } from "react";
import { ConceptRecord, GenerateResponse } from "@/lib/apiTypes";
import { parseSections } from "@/lib/generation/parseSections";

interface BuildResult {
  conceptId: string;
  downloadUrl: string;
}

export default function Home() {
  const [ageBand, setAgeBand] = useState("");
  const [theme, setTheme] = useState("");
  const [difficultyTarget, setDifficultyTarget] = useState("");

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [response, setResponse] = useState<GenerateResponse | null>(null);

  const [buildingConceptId, setBuildingConceptId] = useState<string | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [buildResult, setBuildResult] = useState<BuildResult | null>(null);

  async function handleGenerate(event: React.FormEvent) {
    event.preventDefault();
    setGenerateError(null);
    setResponse(null);
    setBuildResult(null);
    setBuildError(null);
    setGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age_band: ageBand,
          theme,
          difficulty_target: difficultyTarget || null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? `Request failed with HTTP ${res.status}`);
      }
      setResponse(data as GenerateResponse);
    } catch (err) {
      setGenerateError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleBuild(conceptId: string) {
    setBuildingConceptId(conceptId);
    setBuildError(null);

    try {
      const res = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept_id: conceptId }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error ?? `Build failed with HTTP ${res.status}`);
      }
      setBuildResult({ conceptId, downloadUrl: data.download_url });
    } catch (err) {
      setBuildError((err as Error).message);
    } finally {
      setBuildingConceptId(null);
    }
  }

  return (
    <div className="container">
      <h1>Quest Engine</h1>
      <p className="subtitle">
        Enter an age band and theme, generate 3 concepts, pick one, build the PDF.
      </p>

      <form onSubmit={handleGenerate}>
        <label>
          Age band
          <input
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value)}
            placeholder="e.g. 10-12"
            required
          />
        </label>
        <label>
          Theme / subject
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g. tree rings and fire history"
            required
          />
        </label>
        <label>
          Difficulty target (optional)
          <input
            value={difficultyTarget}
            onChange={(e) => setDifficultyTarget(e.target.value)}
            placeholder="e.g. stretch for the top of the band"
          />
        </label>
        <button type="submit" disabled={generating}>
          {generating ? "Generating…" : response ? "Regenerate" : "Generate 3 concepts"}
        </button>
      </form>

      {generateError && <div className="error">{generateError}</div>}

      {response && (
        <section>
          <h2>3 concepts</h2>
          {response.concepts.map((concept, index) => (
            <ConceptCard
              key={concept.id}
              index={index}
              concept={concept}
              building={buildingConceptId === concept.id}
              downloadUrl={buildResult?.conceptId === concept.id ? buildResult.downloadUrl : null}
              onBuild={() => handleBuild(concept.id)}
            />
          ))}
          {buildError && <div className="error">{buildError}</div>}
        </section>
      )}
    </div>
  );
}

function ConceptCard({
  index,
  concept,
  building,
  downloadUrl,
  onBuild,
}: {
  index: number;
  concept: ConceptRecord;
  building: boolean;
  downloadUrl: string | null;
  onBuild: () => void;
}) {
  const sections = parseSections(concept.raw_output);

  return (
    <article className="card">
      <h3>Concept {index + 1}</h3>

      {/* Ethics flags are never hidden or filtered - docs/02_ethics.md's uncertainty rule */}
      {concept.ethics_flag && (
        <div className="flag-banner">⚠ Flagged for review: {concept.ethics_flag}</div>
      )}

      {sections.map((section, i) => (
        <div key={i}>
          {section.label && <div className="section-label">{section.label}</div>}
          <div className="section-body">{section.body}</div>
        </div>
      ))}

      <div className="section-label">SKILLS CLAIMED (taxonomy category)</div>
      <ul className="skills-list">
        {concept.skills_claimed.map((claim, i) => (
          <li key={i} className="skill-item">
            <strong>{claim.sub_skill}</strong>
            {claim.skill ? ` (${claim.skill})` : " (not found in taxonomy)"}
            <br />
            moment: {claim.moment}
            <br />
            why load-bearing: {claim.justification}
          </li>
        ))}
      </ul>

      <div className="section-label">DETERMINISTIC CHECKS</div>
      <ul className="checks-list">
        {concept.checks.map((check) => (
          <li key={check.id} className={`check-item ${check.passed ? "check-pass" : "check-fail"}`}>
            <span className="check-status">{check.passed ? "PASS" : "FAIL"}</span>
            {check.check_type}: {check.detail}
          </li>
        ))}
      </ul>

      <div className="card-actions">
        <button onClick={onBuild} disabled={building}>
          {building ? "Building…" : "Select this concept & build PDF"}
        </button>
        {downloadUrl && (
          <a className="download-link" href={downloadUrl}>
            Download PDF
          </a>
        )}
      </div>
    </article>
  );
}
