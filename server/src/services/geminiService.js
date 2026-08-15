import {
  CATEGORIES, OPPORTUNITY_TYPES, EDUCATION_LEVELS, GENDER_REQUIREMENTS, INDIAN_STATES,
} from '../utils/constants.js';

const GEMINI_MODEL = 'gemini-flash-latest';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    keywords: { type: 'STRING' },
    category: { type: 'STRING', enum: CATEGORIES, nullable: true },
    type: { type: 'STRING', enum: OPPORTUNITY_TYPES, nullable: true },
    state: { type: 'STRING', enum: INDIAN_STATES, nullable: true },
    minEducationLevel: { type: 'STRING', enum: EDUCATION_LEVELS, nullable: true },
    gender: { type: 'STRING', enum: GENDER_REQUIREMENTS, nullable: true },
  },
  required: ['keywords'],
};

let warnedMissingKey = false;

/**
 * Parses a free-text search query into structured filters using Gemini.
 * Falls back to using the raw query as keywords if the API key is missing
 * or the request fails, so search always keeps working.
 */
export async function parseSearchQuery(query) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    if (!warnedMissingKey) {
      console.warn('GEMINI_API_KEY not set; AI search falling back to plain-text search.');
      warnedMissingKey = true;
    }
    return { keywords: query };
  }

  const prompt = `You are a search-query parser for an Indian government jobs/schemes/scholarships portal.
Given a user's free-text search, extract structured filters. Only set a field when the query clearly implies it; otherwise leave it as an empty string.

- keywords: the core search terms (job title, organization, subject) with filter words like state names, education level, or gender removed. Never leave this empty; if nothing else is meaningful, reuse the original query.
- category: one of [${CATEGORIES.join(', ')}]
- type: one of [${OPPORTUNITY_TYPES.join(', ')}]
- state: one of [${INDIAN_STATES.join(', ')}] if a specific state/domicile is mentioned
- minEducationLevel: one of [${EDUCATION_LEVELS.join(', ')}] if an education level is mentioned (e.g. "10th pass", "graduate")
- gender: one of [${GENDER_REQUIREMENTS.join(', ')}] if the query specifies "for women"/"for men" etc.

User query: "${query}"`;

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          temperature: 0,
        },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`Gemini API responded ${res.status}`);

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty Gemini response');

    const parsed = JSON.parse(text);
    return {
      keywords: parsed.keywords?.trim() || query,
      category: parsed.category || undefined,
      type: parsed.type || undefined,
      state: parsed.state || undefined,
      minEducationLevel: parsed.minEducationLevel || undefined,
      gender: parsed.gender || undefined,
    };
  } catch (err) {
    console.error('Gemini search parse failed, falling back to plain text:', err.message);
    return { keywords: query };
  }
}
