import { getAnthropicClient } from "@/lib/anthropic";
import { loadSystemPrompt } from "@/lib/docs";
import { CONCEPT_OUTPUT_SCHEMA, GeneratedConcept, GeneratedConceptsPayload } from "./schema";

const MODEL = "claude-opus-5";

export interface GenerationInput {
  ageBand: string;
  theme: string;
  difficultyTarget: string | null;
}

export async function generateConcepts(
  input: GenerationInput
): Promise<GeneratedConcept[]> {
  const client = getAnthropicClient();
  const systemPrompt = await loadSystemPrompt();

  const userMessage = [
    `Age band: ${input.ageBand}`,
    `Theme/subject: ${input.theme}`,
    `Difficulty target: ${input.difficultyTarget ?? "not specified"}`,
  ].join("\n");

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    system: systemPrompt,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      format: { type: "json_schema", schema: CONCEPT_OUTPUT_SCHEMA },
    },
    messages: [{ role: "user", content: userMessage }],
  });

  const finalMessage = await stream.finalMessage();

  if (finalMessage.stop_reason === "refusal") {
    throw new Error(
      `Model declined the request: ${JSON.stringify(finalMessage.stop_details)}`
    );
  }

  const textBlock = finalMessage.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Model response contained no text block");
  }

  let payload: GeneratedConceptsPayload;
  try {
    payload = JSON.parse(textBlock.text);
  } catch (err) {
    throw new Error(`Model output was not valid JSON: ${(err as Error).message}`);
  }

  if (!Array.isArray(payload.concepts) || payload.concepts.length !== 3) {
    throw new Error(
      `Expected 3 concepts, got ${Array.isArray(payload.concepts) ? payload.concepts.length : "non-array"}`
    );
  }

  return payload.concepts;
}
