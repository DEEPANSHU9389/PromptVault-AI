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
    const { text, taskType } = req.body || {}; // taskType: 'title-polish' | 'tag-suggest' | 'quick-summary'
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      if (taskType === 'title-polish') {
        return res.json({ result: text.slice(0, 40).toUpperCase() + ' [POLISHED]' });
      }
      if (taskType === 'tag-suggest') {
        return res.json({ tags: ['AI', 'Productivity', 'Fast'] });
      }
      return res.json({ result: 'Fast assist completed.' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    let promptInstruction = '';
    if (taskType === 'title-polish') {
      promptInstruction = `Refine this title into a punchy, 3-6 word professional title for a prompt library. Return only the title string. Text: "${text}"`;
    } else if (taskType === 'tag-suggest') {
      promptInstruction = `Extract 3-5 relevant concise tags as a JSON array of strings e.g. ["Marketing", "SaaS", "Copywriting"]. Text: "${text}"`;
    } else {
      promptInstruction = `Summarize this text in 1-2 punchy sentences. Text: "${text}"`;
    }

    // Fast task model gemini-3.1-flash-lite
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: promptInstruction,
      config: taskType === 'tag-suggest' ? { responseMimeType: 'application/json' } : undefined,
    });

    const outputText = response.text?.trim() || '';
    if (taskType === 'tag-suggest') {
      try {
        const tags = JSON.parse(outputText);
        return res.json({ tags: Array.isArray(tags) ? tags : ['AI', 'Custom'] });
      } catch {
        return res.json({ tags: ['AI', 'Productivity'] });
      }
    }

    return res.json({ result: outputText });
  } catch (error: any) {
    console.error('Quick assist error:', error);
    return res.status(500).json({ error: 'Quick assist failed', details: error.message });
  }
}
