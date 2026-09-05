import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { applyCors } from './_utils/cors';
import { checkRateLimit } from './_utils/rate-limit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!checkRateLimit(req, res, 20, 60000)) return;

  try {
    const { rawPrompt, useHighThinking } = req.body || {};
    if (!rawPrompt || !rawPrompt.trim()) {
      return res.status(400).json({ error: 'Raw prompt text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      const enhancedFallback = `Act as a Senior Domain Specialist and Expert.\n\nContext & Task:\n${rawPrompt}\n\nConstraints & Format:\n- Output clearly structured bullet points\n- Highlight key takeaways and action items\n- Maintain a professional and actionable tone\n\nVariables:\n[Topic]: ${rawPrompt}\n[Target Audience]: General / Business`;
      return res.json({
        score: 88,
        enhancedPrompt: enhancedFallback,
        rationale:
          'Added explicit role context, output formatting rules, and customizable variable placeholders for reusable execution.',
        suggestedVariables: ['Topic', 'Target Audience'],
        improvements: [
          'Established expert domain persona',
          'Structured response requirements with clear constraints',
          'Added bracketed variable placeholders [Topic] & [Target Audience]',
        ],
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const systemInstruction = `You are an expert AI Prompt Engineer and Prompt Optimization Studio engine.
Your task is to analyze raw or weak user prompts and transform them into world-class, professional, highly structured AI prompts.

Return ONLY a JSON object matching this exact schema:
{
  "score": <number from 75 to 98 evaluating clarity, role alignment, constraints, and safety>,
  "enhancedPrompt": "<The full, beautifully formatted enhanced prompt with role, context, constraints, and dynamic placeholders in [Square Brackets]>",
  "rationale": "<A 2-3 sentence explanation of why and how this prompt was improved>",
  "suggestedVariables": ["<var1>", "<var2>"],
  "improvements": ["<bullet 1>", "<bullet 2>", "<bullet 3>"]
}

Rules:
1. Identify missing context, vagueness, or weak structure in the original prompt.
2. Formulate a strong Role/Persona (e.g., "Act as a Senior Software Engineer...").
3. Use square brackets like [Target Audience], [Topic], [Format] for dynamic input fields.
4. Add strict constraints (tone, output structure, word count, edge cases).
5. Ensure response is valid JSON.`;

    // Select model and config based on high thinking mode requirement
    const selectedModel = useHighThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash';
    const config: any = {
      systemInstruction,
      responseMimeType: 'application/json',
    };

    if (useHighThinking) {
      // High Thinking Mode using gemini-3.1-pro-preview with ThinkingLevel.HIGH
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: `Optimize this prompt:\n\n"${rawPrompt}"`,
      config,
    });

    const text = response.text || '{}';
    try {
      const parsed = JSON.parse(text);
      return res.json({ ...parsed, modelUsed: selectedModel, highThinking: Boolean(useHighThinking) });
    } catch (e) {
      return res.json({
        score: 85,
        enhancedPrompt: text,
        rationale: 'Enhanced prompt with improved structure and context constraints.',
        suggestedVariables: ['Topic'],
        improvements: ['Added role context', 'Defined output constraints'],
        modelUsed: selectedModel,
        highThinking: Boolean(useHighThinking),
      });
    }
  } catch (error: any) {
    console.error('Error optimizing prompt via Gemini API:', error);
    return res.status(500).json({
      error: 'Failed to optimize prompt',
      details: error.message || String(error),
    });
  }
}
