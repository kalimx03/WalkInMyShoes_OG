/**
 * bedrock.ts — Amazon Bedrock service (Nova 2 Lite)
 * Exports `geminiService` alias — zero component changes needed
 */

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? '';
const TIMEOUT_MS = 55000;

async function callLambda(payload: object, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      const res = await fetch(`${API_BASE}/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.status === 429 && attempt < retries) {
        await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
        continue;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
      return data;
    } catch (err: any) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function analyzeAccessibility(imageBase64: string): Promise<string> {
  const data = await callLambda({ action: 'analyzeAccessibility', imageBase64 });
  let raw: string = data?.result ?? '';
  raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.issues) throw new Error('Missing issues');
    return JSON.stringify(parsed);
  } catch {
    return JSON.stringify({
      issues: [{
        type: 'SCAN_ERROR', status: 'WARNING',
        description: 'Could not parse AI response. Please retry.',
        recommendation: 'Retry scan with better lighting.',
        costEstimate: 'N/A', coordinates: [100, 100, 400, 400],
      }],
      overallComplianceScore: 50,
    });
  }
}

async function editImage(imageBase64: string, prompt: string): Promise<string> {
  const data = await callLambda({ action: 'editImage', imageBase64, prompt });
  return data?.result ?? 'No report generated.';
}

function createGuideChat(context: string, _initialHistory: any[] = []) {
  const history: Array<{ role: string; content: string }> = [];
  return {
    async sendMessage(text: string): Promise<{ text: string }> {
      history.push({ role: 'user', content: text });
      try {
        const data = await callLambda({ action: 'chat', context, messages: [...history] });
        const reply = data?.result ?? 'How can I help you with accessibility?';
        history.push({ role: 'assistant', content: reply });
        return { text: reply };
      } catch (err: any) {
        return { text: `AI Guide offline — ${err.message}` };
      }
    },
  };
}

export const bedrockService = { analyzeAccessibility, editImage, createGuideChat };
export { bedrockService as geminiService };
