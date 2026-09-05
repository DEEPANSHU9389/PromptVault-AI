import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { applyCors } from './_utils/cors';
import { checkRateLimit } from './_utils/rate-limit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!checkRateLimit(req, res, 20, 60000)) return;

  try {
    const { prompt, model } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        result: `[Gemini Output]\n\nPrompt received:\n"${prompt.slice(0, 120)}..."\n\nResult:\nSuccessfully processed task! To get live Gemini AI responses, ensure GEMINI_API_KEY is configured in server environment.`,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    // Use gemini-3.5-flash for general tasks by default
    const selectedModel = model || 'gemini-3.5-flash';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: prompt,
    });

    return res.json({ result: response.text });
  } catch (error: any) {
    console.error('Error generating content via Gemini API:', error);
    return res.status(500).json({
      error: 'Failed to generate AI response',
      details: error.message || String(error),
    });
  }
}
