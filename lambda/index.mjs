/**
 * walkinmyshoes-ai — Lambda Function
 * Runtime:  Node.js 20.x
 * Handler:  index.handler
 * Model:    Amazon Bedrock — Nova 2 Lite (us.amazon.nova-lite-v1:0)
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectTextCommand,
} from "@aws-sdk/client-rekognition";

const REGION        = "us-east-1";
const BEDROCK_MODEL = "us.amazon.nova-lite-v1:0";
const MAX_IMG_BYTES = 4 * 1024 * 1024;

const bedrock     = new BedrockRuntimeClient({ region: REGION });
const rekognition = new RekognitionClient({ region: REGION });

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Content-Type":                 "application/json",
};

function respond(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

async function nova(system, messages, maxTokens = 2000) {
  const cmd = new InvokeModelCommand({
    modelId:     BEDROCK_MODEL,
    contentType: "application/json",
    accept:      "application/json",
    body: JSON.stringify({
      messages: messages.map(m => ({
        role: m.role,
        content: typeof m.content === "string"
          ? [{ text: m.content }]
          : m.content,
      })),
      system: [{ text: system }],
      inferenceConfig: {
        max_new_tokens: maxTokens,
        temperature: 0.5,
      },
    }),
  });
  const res  = await bedrock.send(cmd);
  const body = JSON.parse(new TextDecoder().decode(res.body));
  return (body.output?.message?.content?.[0]?.text ?? "").trim();
}

export const handler = async (event) => {
  const method = event.httpMethod ?? event.requestContext?.http?.method ?? "";
  if (method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return respond(400, { error: "Invalid JSON body" });
  }

  const { action, imageBase64, prompt, messages, context } = body;

  try {

    if (action === "analyzeAccessibility") {
      if (!imageBase64) return respond(400, { error: "imageBase64 required" });

      const imgBuf = Buffer.from(imageBase64, "base64");
      if (imgBuf.length > MAX_IMG_BYTES) {
        return respond(400, { error: `Image too large (${(imgBuf.length/1024/1024).toFixed(1)} MB). Max 4 MB.` });
      }

      const [labelsRes, textRes] = await Promise.all([
        rekognition.send(new DetectLabelsCommand({
          Image: { Bytes: imgBuf }, MaxLabels: 40, MinConfidence: 55,
        })),
        rekognition.send(new DetectTextCommand({
          Image: { Bytes: imgBuf },
        })),
      ]);

      const labels = labelsRes.Labels
        ?.map(l => {
          const parents = l.Parents?.map(p => p.Name).filter(Boolean).join(", ");
          return parents ? `${l.Name} (${Math.round(l.Confidence)}%, in: ${parents})` : `${l.Name} (${Math.round(l.Confidence)}%)`;
        })
        .join("; ") || "no objects detected";

      const visibleText = textRes.TextDetections
        ?.filter(t => t.Type === "LINE" && (t.Confidence ?? 0) > 70)
        .map(t => t.DetectedText)
        .join(", ") || "no text visible";

      const boxes = labelsRes.Labels
        ?.filter(l => l.Instances?.length > 0)
        .flatMap(l => l.Instances.map(inst => ({
          name:   l.Name,
          top:    Math.round((inst.BoundingBox?.Top ?? 0) * 1000),
          left:   Math.round((inst.BoundingBox?.Left ?? 0) * 1000),
          bottom: Math.round(((inst.BoundingBox?.Top ?? 0) + (inst.BoundingBox?.Height ?? 0)) * 1000),
          right:  Math.round(((inst.BoundingBox?.Left ?? 0) + (inst.BoundingBox?.Width ?? 0)) * 1000),
        })))
        .slice(0, 12)
        .map(b => `${b.name}: [top=${b.top}, left=${b.left}, bottom=${b.bottom}, right=${b.right}]`)
        .join("\n") || "no bounding box data";

      const auditResult = await nova(
        "You are a certified ADA 2010 + WCAG 2.1 accessibility inspector. " +
        "Respond ONLY with a single valid JSON object. No markdown, no backticks, no explanation whatsoever.",
        [{ role: "user", content:
          `Amazon Rekognition detected the following in the camera frame:

OBJECTS DETECTED: ${labels}
TEXT VISIBLE: ${visibleText}
BOUNDING BOXES (0-1000 coordinate space):
${boxes}

Perform a comprehensive ADA 2010 + WCAG 2.1 + RPWD Act 2016 accessibility audit.
Audit: DOORWAY(≥32"), RAMP(≤1:12), STEPS, PATHWAY(≥36"), TACTILE PAVING, SIGNAGE(contrast≥3:1),
CONTROLS(15-48" AFF), SEATING, PARKING, OBSTACLES, EMERGENCY, FLOORING(ASTM≥0.6), LIGHTING.

Use bounding box coordinates for detected elements. Min box size 80×80. Format: [ymin,xmin,ymax,xmax].

Return ONLY this JSON:
{"issues":[{"type":"ELEMENT_TYPE","status":"COMPLIANT" or "NON_COMPLIANT" or "WARNING","description":"Specific observation with measurement","recommendation":"Exact ADA fix with code section","costEstimate":"$X-$Y","coordinates":[ymin,xmin,ymax,xmax]}],"overallComplianceScore":0-100}

Find MINIMUM 5 issues.`
        }],
        2500
      );

      return respond(200, { result: auditResult });
    }

    if (action === "editImage") {
      if (!imageBase64 || !prompt) return respond(400, { error: "imageBase64 and prompt required" });

      const imgBuf = Buffer.from(imageBase64, "base64");
      if (imgBuf.length > MAX_IMG_BYTES) return respond(400, { error: "Image too large. Max 4 MB." });

      const labelsRes = await rekognition.send(new DetectLabelsCommand({
        Image: { Bytes: imgBuf }, MaxLabels: 25, MinConfidence: 65,
      }));

      const sceneContext = labelsRes.Labels?.map(l => l.Name).join(", ") || "physical space";

      const report = await nova(
        "You are a licensed ADA compliance architect with 20 years experience. " +
        "Provide complete, contractor-ready remediation specifications with exact measurements, materials, costs, and code references.",
        [{ role: "user", content:
          `Reviewing this space for ADA accessibility remediation.
Amazon Rekognition identified: ${sceneContext}
REMEDIATION REQUEST: ${prompt}

Generate a COMPLETE contractor-ready ADA remediation specification:
## 1. Site Observation
## 2. ADA Violation (exact code section, current vs required with measurements)
## 3. Remediation Specification (materials, steps, dimensions, permits)
## 4. Expected Outcome (wheelchair, low-vision, mobility-impaired, deaf users)
## 5. Cost Breakdown (Materials/Labor/Permits in ₹ and $)
## 6. Code References (ADA 2010, WCAG 2.1, RPWD Act 2016, NBC 2016)
## 7. Priority & Timeline (CRITICAL/HIGH/MEDIUM/LOW + weeks)`
        }],
        2500
      );

      return respond(200, { result: report });
    }

    if (action === "chat") {
      if (!Array.isArray(messages) || messages.length === 0) {
        return respond(200, { result: "Hi! I'm your AI accessibility guide powered by Amazon Bedrock. How can I help?" });
      }

      const cleaned = messages
        .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
        .slice(-20);

      while (cleaned.length > 0 && cleaned[0].role !== "user") cleaned.shift();

      if (cleaned.length === 0) {
        return respond(200, { result: "How can I help you with accessibility today?" });
      }

      const systemPrompt =
        `You are the AI Expert Guide in WalkInMyShoes, an immersive empathy and accessibility training platform built for AWS AI for Bharat 2026. You are powered by Amazon Bedrock (Amazon Nova 2 Lite).
Current training session: "${context || "Accessibility Training"}"
RULES:
- Keep responses to 2-4 sentences unless user explicitly asks for more detail
- ALWAYS cite exact ADA sections (§) or WCAG success criteria (e.g. SC 1.4.3) when relevant
- Reference RPWD Act 2016 and NBC 2016 for Indian accessibility context
- Give specific measurements and standards — never vague advice
- Be empathetic, confident, educational — never refuse to help
- Use real India-specific statistics: "2.68 crore people in India have disabilities (Census 2011)"
- Mention that you are powered by Amazon Bedrock when asked about your technology`;

      const reply = await nova(systemPrompt, cleaned, 700);
      return respond(200, { result: reply || "How can I help you with accessibility today?" });
    }

    return respond(400, { error: `Unknown action: "${action}". Valid: analyzeAccessibility, editImage, chat` });

  } catch (err) {
    console.error("[Lambda Error]", action, err);
    return respond(500, { error: err.message || "Internal server error" });
  }
};
