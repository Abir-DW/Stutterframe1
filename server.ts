import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

let appDir = process.cwd();
try {
  if (typeof __dirname !== 'undefined') {
    appDir = __dirname;
  } else if (typeof import.meta !== 'undefined' && import.meta.url) {
    appDir = path.dirname(fileURLToPath(import.meta.url));
  }
} catch {
  appDir = process.cwd();
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parser middleware: Only parse if req.body has not already been populated by Vercel serverless runtime
app.use((req, res, next) => {
  if (req.body !== undefined && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  express.json({ limit: '25mb' })(req, res, (err) => {
    if (err) return next(err);
    express.urlencoded({ extended: true, limit: '25mb' })(req, res, next);
  });
});

// CORS & Preflight handling for Vercel and cross-origin environments
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Normalize URLs if a serverless proxy or rewrite strips the '/api' prefix
app.use((req, _res, next) => {
  // Support Vercel catch-all slug parameter: api/[...slug].ts
  if (req.query && req.query.slug) {
    const slug = req.query.slug;
    const slugPath = Array.isArray(slug) ? slug.join('/') : String(slug);
    if (slugPath) {
      req.url = '/api/' + slugPath;
    }
  }

  // Check if Vercel or a reverse proxy forwarded the real URI in headers
  const forwarded = (req.headers['x-forwarded-uri'] || req.headers['x-matched-path']) as string;
  if (forwarded && forwarded.includes('/api/')) {
    const apiIndex = forwarded.indexOf('/api/');
    req.url = forwarded.substring(apiIndex);
  }

  if (
    !req.url.startsWith('/api') &&
    (req.url.startsWith('/movie-picker') ||
      req.url.startsWith('/shot-rater') ||
      req.url.startsWith('/script-lab') ||
      req.url.startsWith('/gear-suggestor') ||
      req.url.startsWith('/editor-advisor') ||
      req.url.startsWith('/assistant') ||
      req.url.startsWith('/quota') ||
      req.url.startsWith('/health'))
  ) {
    req.url = '/api' + req.url;
  }
  next();
});

// Dynamic API Key retrieval for serverless, runtime, and client-supplied sessions
let userSessionApiKey = '';

function resolveApiKey(explicitKey?: string): string {
  if (explicitKey && typeof explicitKey === 'string' && explicitKey.trim() && explicitKey.trim() !== 'undefined' && explicitKey.trim() !== 'null') {
    return explicitKey.trim();
  }
  if (userSessionApiKey && userSessionApiKey.trim()) {
    return userSessionApiKey.trim();
  }
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

function getApiKey(overrideKey?: string): string {
  return resolveApiKey(overrideKey);
}

// Shared Gemini client factory to ensure fresh environment variable binding
function getAiClient(explicitKey?: string): GoogleGenAI {
  const key = resolveApiKey(explicitKey);
  const headers: Record<string, string> = {
    'User-Agent': 'aistudio-build',
  };
  if (key) {
    headers['x-goog-api-key'] = key;
  }
  return new GoogleGenAI({
    apiKey: key || 'dummy-key-placeholder',
    httpOptions: {
      headers,
    },
  });
}

// Helper to extract API key from Express request
function extractReqApiKey(req: Request): string {
  const headerKey = req.headers['x-gemini-api-key'] as string;
  if (headerKey && headerKey.trim() && headerKey !== 'undefined') return headerKey.trim();
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.substring(7).trim();
    if (token && token !== 'undefined') return token;
  }
  if (req.body && typeof req.body === 'object' && req.body.apiKey) {
    return String(req.body.apiKey).trim();
  }
  return '';
}

// Guard API routes if GEMINI_API_KEY is not set (e.g. fresh Vercel deploy)
app.use((req, res, next) => {
  const isApi = req.url.startsWith('/api') || req.path.startsWith('/api');
  if (!isApi) {
    return next();
  }
  if (req.path.endsWith('/health') || req.path.endsWith('/quota') || req.path.endsWith('/key') || req.path.endsWith('/key-status')) {
    return next();
  }
  const key = resolveApiKey(extractReqApiKey(req));
  if (!key || key === 'dummy-key-placeholder') {
    return res.status(401).json({
      error:
        'Google Gemini API key or session token is missing or expired. Please configure a valid Gemini API key.',
    });
  }
  next();
});

// API Key status and verification endpoints
app.get('/api/key-status', (req: Request, res: Response) => {
  const reqKey = extractReqApiKey(req);
  const activeKey = resolveApiKey(reqKey);
  const isSet = Boolean(activeKey && activeKey.length > 5);
  const isCustom = Boolean(userSessionApiKey || (reqKey && reqKey.length > 5));
  res.json({
    configured: isSet,
    isCustom,
    masked: isSet ? `${activeKey.slice(0, 6)}...${activeKey.slice(-4)}` : null,
  });
});

app.post('/api/key', async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body || {};
    if (!apiKey || !String(apiKey).trim()) {
      userSessionApiKey = '';
      return res.json({ success: true, message: 'Custom session key cleared.' });
    }

    const testKey = String(apiKey).trim();
    // Test key with light ping
    const testRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': testKey,
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping' }] }] }),
    });

    if (!testRes.ok) {
      const errData = await testRes.json().catch(() => ({}));
      const msg = errData?.error?.message || `Google API returned status ${testRes.status}`;
      return res.status(400).json({ error: `Key validation failed: ${msg}` });
    }

    userSessionApiKey = testKey;
    res.json({ success: true, message: 'Google Gemini API key connected successfully!' });
  } catch (err: any) {
    res.status(400).json({ error: err?.message || 'Failed to validate API key with Google.' });
  }
});

const FLASH_MODEL = 'gemini-3.1-flash-lite';
const FAST_CHAT_MODEL = 'gemini-3.1-flash-lite';

// Live rolling window quota and prompt tracker
interface RequestTimestamp {
  timestamp: number;
}
const requestHistory: RequestTimestamp[] = [];
const RPM_LIMIT = 15; // Google Gemini Free Tier Rolling Requests Per Minute
let globalCooldownUntil: number | null = null;
let lastActiveModel = 'gemini-3.1-flash-lite';

function recordModelRequest(modelUsed?: string) {
  const now = Date.now();
  requestHistory.push({ timestamp: now });
  if (modelUsed) lastActiveModel = modelUsed;
  // Prune history older than 60 seconds
  const oneMinuteAgo = now - 60000;
  while (requestHistory.length > 0 && requestHistory[0].timestamp < oneMinuteAgo) {
    requestHistory.shift();
  }
}

function setQuotaCooldown(seconds: number) {
  globalCooldownUntil = Date.now() + seconds * 1000;
}

function getQuotaStatus() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  // Prune
  while (requestHistory.length > 0 && requestHistory[0].timestamp < oneMinuteAgo) {
    requestHistory.shift();
  }

  const isCooldown = globalCooldownUntil !== null && globalCooldownUntil > now;
  let refreshSeconds = 0;

  if (isCooldown && globalCooldownUntil) {
    refreshSeconds = Math.max(1, Math.ceil((globalCooldownUntil - now) / 1000));
  } else if (requestHistory.length > 0) {
    // Next request slot frees up when the oldest request in the 60s window rolls off
    const oldest = requestHistory[0].timestamp;
    refreshSeconds = Math.max(1, Math.ceil((oldest + 60000 - now) / 1000));
  } else {
    refreshSeconds = 60;
  }

  const remaining = isCooldown ? 0 : Math.max(0, RPM_LIMIT - requestHistory.length);

  return {
    requestsRemaining: remaining,
    maxPerMinute: RPM_LIMIT,
    refreshSeconds,
    activeModel: lastActiveModel,
    isCooldown,
  };
}

// Helper to extract retryDelay seconds from error responses (e.g. 429 RESOURCE_EXHAUSTED)
function extractRetryDelaySeconds(error: any): number | null {
  try {
    const raw = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
    // 1. Try parsing JSON error structure
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch {}
      }
    }

    if (parsed) {
      const details = parsed.error?.details || parsed.details || [];
      if (Array.isArray(details)) {
        for (const d of details) {
          if (d.retryDelay) {
            const num = parseFloat(String(d.retryDelay).replace('s', ''));
            if (!isNaN(num) && num > 0) return Math.ceil(num);
          }
        }
      }
    }

    // 2. Regex fallback for retryDelay or "retry after Xs"
    const delayMatch =
      raw.match(/retry(?:Delay|_delay)?["'\s:]+(\d+(?:\.\d+)?)\s*s?/i) ||
      raw.match(/retry after\s+(\d+)\s*(?:seconds?|s)?/i) ||
      raw.match(/try again in\s+(\d+)\s*(?:seconds?|s)?/i) ||
      raw.match(/wait\s+(\d+)\s*(?:seconds?|s)?/i);

    if (delayMatch && delayMatch[1]) {
      const val = parseFloat(delayMatch[1]);
      if (!isNaN(val) && val > 0) return Math.ceil(val);
    }

    // 3. If it's a 429 quota exhaustion, default to 15s countdown
    if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')) {
      return 15;
    }
  } catch {
    // ignore
  }
  return null;
}

// User-friendly error message cleaner (avoid raw JSON dumps)
function cleanErrorMessage(error: any): string {
  const raw = typeof error === 'string' ? error : (error?.message || '');
  if (raw.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') || raw.includes('UNAUTHENTICATED') || raw.includes('401') || raw.includes('invalid authentication credentials')) {
    return 'Google Gemini API key or session token is missing or expired. Please select a valid Gemini API key in your workspace settings.';
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429') || raw.includes('quota')) {
    return 'Google Gemini Free-Tier request limit reached. Automatic rate-limit cooldown in progress.';
  }
  if (raw.includes('503') || raw.includes('high demand') || raw.includes('UNAVAILABLE')) {
    return 'Gemini AI model is momentarily experiencing high demand. Please try again shortly.';
  }
  return error?.message || 'Processing failed. Please retry.';
}

// Normalizes varied contents formats (string, object with parts, array of parts, or standard content array) into valid Gemini REST API contents format
function normalizeContents(contents: any): any[] {
  if (!contents) return [{ role: 'user', parts: [{ text: '' }] }];
  if (typeof contents === 'string') {
    return [{ role: 'user', parts: [{ text: contents }] }];
  }
  if (Array.isArray(contents)) {
    if (contents.length === 0) return [{ role: 'user', parts: [{ text: '' }] }];
    // Check if it's already an array of Content objects (with .parts) or an array of Part objects
    if (contents[0] && contents[0].parts) {
      return contents.map(c => ({
        role: c.role || 'user',
        parts: c.parts,
      }));
    }
    // If it's an array of part objects (e.g. [{ inlineData: ... }, { text: ... }])
    return [{ role: 'user', parts: contents }];
  }
  if (typeof contents === 'object') {
    if (contents.parts) {
      return [{ role: contents.role || 'user', parts: contents.parts }];
    }
    if (contents.text) {
      return [{ role: contents.role || 'user', parts: [{ text: contents.text }] }];
    }
    return [{ role: 'user', parts: [contents] }];
  }
  return [{ role: 'user', parts: [{ text: String(contents) }] }];
}

// Direct REST helper using X-goog-api-key header to prevent SDK Authorization Bearer injection issues
async function callGeminiREST(model: string, contents: any, config?: any, apiKeyOverride?: string) {
  const apiKey = resolveApiKey(apiKeyOverride);
  if (!apiKey) {
    throw new Error('Google Gemini API key or session token is missing or expired. Please enter a valid Gemini API key.');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body: any = { contents: normalizeContents(contents) };
  if (config) {
    if (config.systemInstruction) {
      body.systemInstruction = typeof config.systemInstruction === 'string'
        ? { parts: [{ text: config.systemInstruction }] }
        : config.systemInstruction;
    }
    const genConfig: any = {};
    if (config.temperature !== undefined) genConfig.temperature = config.temperature;
    if (config.maxOutputTokens !== undefined) genConfig.maxOutputTokens = config.maxOutputTokens;
    if (config.thinkingConfig !== undefined) genConfig.thinkingConfig = config.thinkingConfig;
    if (Object.keys(genConfig).length > 0) {
      body.generationConfig = genConfig;
    }
    if (config.tools) {
      body.tools = config.tools;
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Gemini API error status ${res.status}`);
  }

  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';
  return {
    text,
    candidates: data.candidates,
    usageMetadata: data.usageMetadata,
  };
}

async function* callGeminiStreamREST(model: string, contents: any, config?: any, apiKeyOverride?: string) {
  const apiKey = resolveApiKey(apiKeyOverride);
  if (!apiKey) {
    throw new Error('Google Gemini API key or session token is missing or expired. Please enter a valid Gemini API key.');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`;
  const body: any = { contents: normalizeContents(contents) };
  if (config) {
    if (config.systemInstruction) {
      body.systemInstruction = typeof config.systemInstruction === 'string'
        ? { parts: [{ text: config.systemInstruction }] }
        : config.systemInstruction;
    }
    const genConfig: any = {};
    if (config.temperature !== undefined) genConfig.temperature = config.temperature;
    if (config.maxOutputTokens !== undefined) genConfig.maxOutputTokens = config.maxOutputTokens;
    if (config.thinkingConfig !== undefined) genConfig.thinkingConfig = config.thinkingConfig;
    if (Object.keys(genConfig).length > 0) {
      body.generationConfig = genConfig;
    }
    if (config.tools) {
      body.tools = config.tools;
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `Gemini API error status ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('Response body reader not available');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data:')) {
        const jsonStr = trimmed.substring(5).trim();
        if (jsonStr) {
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
            const candidates = parsed.candidates;
            yield { text, candidates };
          } catch {
            // ignore
          }
        }
      }
    }
  }
}

// Robust helper with multi-model cascade and search-tool quota fallback
async function generateWithRetry(params: {
  contents: any;
  config?: any;
  apiKey?: string;
}) {
  const models = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  // Phase 1: Try with requested configuration (including googleSearch if configured)
  for (const model of models) {
    try {
      const response = await callGeminiREST(model, params.contents, params.config, params.apiKey);
      return response;
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || '');
      // If 429 quota exhaustion occurs with search tool, break immediately to Phase 2 fallback
      if (
        (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) &&
        params.config?.tools?.some((t: any) => t.googleSearch)
      ) {
        break; // break to Phase 2 (direct generation without search tool)
      }
      // If error occurred on this model, continue to try the next model
      continue;
    }
  }

  // Phase 2: If search tool encountered quota limits (429 RESOURCE_EXHAUSTED),
  // fallback to direct Flash inference to guarantee response availability
  if (params.config?.tools?.some((t: any) => t.googleSearch)) {
    const fallbackConfig = { ...params.config };
    delete fallbackConfig.tools;

    for (const model of models) {
      try {
        const response = await callGeminiREST(model, params.contents, fallbackConfig, params.apiKey);
        return response;
      } catch (err: any) {
        lastError = err;
        continue;
      }
    }
  }

  throw lastError || new Error('All model configurations failed to respond. Please retry.');
}

// Resilient multi-tier movie poster resolution via Wikipedia REST & OpenSearch
async function fetchAuthenticMoviePoster(title: string, year?: string): Promise<string | null> {
  try {
    const cleanTitle = title.replace(/\s*\([^)]*\)/g, '').trim();
    const variations = [
      `${cleanTitle} (${year} film)`,
      `${cleanTitle} (film)`,
      cleanTitle,
      `${title} (film)`,
      title,
    ];

    for (const v of variations) {
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(v)}`, {
          headers: { 'User-Agent': 'StutterFrame-Cinema/2.0 (contact@stutterframe.com)' },
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data: any = await res.json();
          if (data.thumbnail?.source && !data.thumbnail.source.includes('Wikiquote')) {
            return data.thumbnail.source;
          }
        }
      } catch {
        // try next variation
      }
    }

    // Fallback: search Wikipedia API
    const sUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanTitle + ' ' + (year || '') + ' film'
    )}&format=json&origin=*`;
    const sRes = await fetch(sUrl, { signal: AbortSignal.timeout(3000) });
    if (sRes.ok) {
      const sData: any = await sRes.json();
      const firstHit = sData.query?.search?.[0]?.title;
      if (firstHit) {
        const res2 = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstHit)}`,
          {
            headers: { 'User-Agent': 'StutterFrame-Cinema/2.0 (contact@stutterframe.com)' },
            signal: AbortSignal.timeout(3000),
          }
        );
        if (res2.ok) {
          const d2: any = await res2.json();
          if (d2.thumbnail?.source) return d2.thumbnail.source;
        }
      }
    }
  } catch {
    // Ignore fallback
  }
  return null;
}

// Helper to build verified where-to-watch links for recommended movies
function buildMovieWatchLinks(title: string, year?: string) {
  const query = encodeURIComponent(`${title} ${year || ''}`.trim());
  const simpleQuery = encodeURIComponent(title);
  return [
    {
      platform: 'JustWatch',
      url: `https://www.justwatch.com/in/search?q=${simpleQuery}`,
      type: 'search',
      badge: 'Streaming & Rent Availability',
    },
    {
      platform: 'YouTube & Google TV',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' movie buy rent')}`,
      type: 'rent',
      badge: 'Rent / Buy Full Movie',
    },
    {
      platform: 'Letterboxd',
      url: `https://letterboxd.com/search/${simpleQuery}/`,
      type: 'search',
      badge: 'Reviews, Cast & Stream Info',
    },
    {
      platform: 'IMDb',
      url: `https://www.imdb.com/find/?q=${query}&s=tt`,
      type: 'search',
      badge: 'Official Catalog & Trivia',
    },
    {
      platform: 'Rotten Tomatoes',
      url: `https://www.rottentomatoes.com/search?search=${simpleQuery}`,
      type: 'search',
      badge: 'Tomatometer & Audience Score',
    },
  ];
}

// Helper to extract JSON from model text (handles Markdown code blocks and resilient repair)
function extractJsonFromText(rawText: string): any {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  // Strip ```json ... ``` wrapper if present
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
  } else {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    // Attempt 1: Remove trailing commas before closing braces/brackets
    try {
      const repaired = cleaned.replace(/,\s*([\]}])/g, '$1');
      return JSON.parse(repaired);
    } catch (err2) {
      // Attempt 2: If truncated or unclosed, try closing unclosed quotes and brackets
      try {
        let fixed = cleaned.replace(/,\s*([\]}])/g, '$1');
        // If quotes are odd, append a quote
        const quoteCount = (fixed.match(/"/g) || []).length;
        if (quoteCount % 2 !== 0) fixed += '"';
        // Count open vs close braces
        const openBraces = (fixed.match(/\{/g) || []).length;
        const closeBraces = (fixed.match(/\}/g) || []).length;
        for (let i = 0; i < openBraces - closeBraces; i++) {
          fixed += '}';
        }
        return JSON.parse(fixed);
      } catch (err3) {
        console.warn('Failed to parse model JSON:', cleaned.slice(0, 200));
        return null;
      }
    }
  }
}

// -------------------------------------------------------------
// 1. Movie Picker (Search Grounded)
// -------------------------------------------------------------
app.post('/api/movie-picker', async (req: Request, res: Response) => {
  try {
    const { genre, language, era, mood, excludeTitles } = req.body;

    if (!genre && !mood) {
      return res.status(400).json({ error: 'Please provide at least a genre or mood.' });
    }

    const excludeClause =
      excludeTitles && Array.isArray(excludeTitles) && excludeTitles.length > 0
        ? `DO NOT recommend any of the following movies: ${excludeTitles.join(', ')}.`
        : '';

    const moodClause =
      mood && mood.toLowerCase() !== 'any mood' && mood.toLowerCase() !== 'any'
        ? `Emotional Mood / Atmosphere: Must strongly evoke a "${mood}" mood/vibe.`
        : `Emotional Mood / Atmosphere: Any mood (explore the most resonant cinematic atmosphere without restricting to a single emotional tone).`;

    const prompt = `You are a legendary cinema curator and film historian.
Research and recommend ONE real, currently existing movie that matches the following criteria:
- Genre: ${genre || 'Any / Cinema'}
- Language/Origin: ${language || 'Any'}
- Era/Decade: ${era || 'Any'}
- ${moodClause}
${excludeClause}

CRITICAL RULES:
1. The movie MUST be 100% real and verifiable. Use Google Search to verify its exact release year, director, cast, and approximate IMDb rating.
2. Under no circumstances invent a movie or cast.
3. Try to locate a genuine public poster thumbnail URL or prominent image link from Wikipedia, Wikimedia, or film database archives in search results if possible (otherwise provide null).
4. Return your output STRICTLY as a single JSON object matching this schema:
{
  "title": "Exact Movie Title",
  "year": "Release Year (e.g. 1994)",
  "director": "Director Name(s)",
  "cinematographer": "Cinematographer Name (DP) if notable, or Unknown",
  "description": "A captivating, cinematic 2-3 line synopsis capturing the essence, conflict, and aesthetic.",
  "mainCast": ["Actor 1", "Actor 2", "Actor 3"],
  "genreTags": ["Film Noir", "Psychological Thriller"],
  "imdbRating": "e.g. 8.1/10 (researched, approximate)",
  "runtime": "e.g. 1h 58m",
  "whyItFits": "1-2 sentences on why this exact film fulfills the specified mood, era, and aesthetic.",
  "cinematographicStyle": "A short note on the visual style (e.g., anamorphic lenses, high-contrast chiaroscuro, natural golden-hour lighting).",
  "posterUrl": "https://... or null"
}
Output only the JSON code block.`;

    const response = await generateWithRetry({
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
      apiKey: extractReqApiKey(req),
    });

    const text = response.text || '';
    let parsed: any;
    try {
      parsed = extractJsonFromText(text);
    } catch (e) {
      // Fallback fallback if JSON formatting had an issue
      parsed = {
        title: 'Cinematic Discovery',
        year: era || 'Classic',
        director: 'Notable Auteur',
        description: text.substring(0, 300),
        mainCast: [],
        genreTags: [genre || 'Film'],
        imdbRating: 'Researched',
        whyItFits: 'Matches your requested cinematic taste.',
        cinematographicStyle: 'Distinct visual identity.',
        posterUrl: null,
      };
    }

    // Extract grounding citations
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri)
      .map((w: any) => ({
        title: w.title || 'Source Citation',
        uri: w.uri,
      }));

    // Resilient poster resolution: If model didn't return an image or gave an invalid/placeholder link,
    // query the Wikipedia REST / Wikimedia high-res movie archive
    if (parsed && parsed.title) {
      const isWeakPoster =
        !parsed.posterUrl ||
        typeof parsed.posterUrl !== 'string' ||
        parsed.posterUrl.includes('placeholder') ||
        parsed.posterUrl.includes('example.com') ||
        parsed.posterUrl.length < 12;

      if (isWeakPoster) {
        const resolvedPoster = await fetchAuthenticMoviePoster(parsed.title, parsed.year);
        if (resolvedPoster) {
          parsed.posterUrl = resolvedPoster;
        }
      }
    }

    // Attach rich verified watch options (JustWatch, YouTube Movies, Letterboxd, IMDb, Rotten Tomatoes)
    if (parsed && parsed.title) {
      const standardWatchLinks = buildMovieWatchLinks(parsed.title, parsed.year);
      parsed.watchLinks = [...standardWatchLinks];
    }

    recordModelRequest('gemini-3.1-flash-lite');

    res.json({
      movie: parsed,
      sources: sources.slice(0, 5),
      searchQueries,
    });
  } catch (error: any) {
    console.error('Error in /api/movie-picker:', error);
    const retryDelay = extractRetryDelaySeconds(error);
    if (retryDelay) {
      setQuotaCooldown(retryDelay);
    }
    const is429 =
      error?.status === 429 ||
      String(error?.message).includes('429') ||
      String(error?.message).includes('RESOURCE_EXHAUSTED') ||
      String(error?.message).includes('quota');

    res.status(is429 ? 429 : 500).json({
      error: cleanErrorMessage(error),
      retryDelaySeconds: retryDelay,
    });
  }
});

// -------------------------------------------------------------
// 2. Shot Rater (Cinematography Vision Feedback)
// -------------------------------------------------------------
app.post('/api/shot-rater', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', userNotes, tier = 'constructive' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Please upload a still frame to analyze.' });
    }

    // Clean base64 string if data url prefix is present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Normalize mimeType
    let safeMime = (mimeType || 'image/jpeg').toLowerCase();
    if (safeMime === 'image/jpg') safeMime = 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(safeMime)) {
      safeMime = 'image/jpeg';
    }

    const selectedTier = String(tier).toLowerCase();

    let tierInstructions = '';
    if (selectedTier === 'friendly') {
      tierInstructions = `EVALUATION TIER: FRIENDLY (Encouraging & Generous)
- Tone: Uplifting, affirmative, and encouraging. Focus heavily on what the filmmaker did right, praising creative intent, visual feeling, framing bravery, and emotional resonance.
- Frame constructive critique gently with warm, supportive suggestions rather than harsh negatives.
- Calibrate numeric scores generously: typical scores should fall between 7.8 and 9.6.`;
    } else if (selectedTier === 'brutal') {
      tierInstructions = `EVALUATION TIER: BRUTAL (Uncompromising, Ruthlessly Honest & Exacting)
- Tone: Unapologetic, razor-sharp, zero sugar-coating. Speak like a notoriously demanding, legendary Hollywood Director of Photography and veteran master colorist with zero tolerance for mediocrity.
- Tear apart every flaw with surgical precision: awkward headroom, unbalanced quadrants, flat lighting, crushed blacks, clipped highlights, clashing color temperatures, digital plasticness, or fake compositing.
- Calibrate numeric scores harshly: average work gets 3.0 - 5.0; decent indie work sits at 5.0 - 6.5; only transcendent, Oscar-caliber mastery exceeds 7.5.`;
    } else if (selectedTier === 'moderate') {
      tierInstructions = `EVALUATION TIER: MODERATE (Objective Industry Screener & Technical Analyst)
- Tone: Neutral, matter-of-fact, balanced. Evaluate the shot against standard commercial indie film festival benchmarks.
- No flattery and no unnecessary harshness—just clear, factual observations on framing geometry, lighting ratios, and color grading.
- Calibrate numeric scores realistically: typical scores should fall between 5.5 and 7.8.`;
    } else {
      // Default: constructive
      tierInstructions = `EVALUATION TIER: CONSTRUCTIVE (Film School Mentor & Masterclass DP Leader)
- Tone: Instructive, professional, pedagogical, and craft-centered. Provide balanced insight into what works and specific technical guidance on how to improve.
- Explain the "why" behind lighting flags, lens choices, fill ratios, and color balance with actionable on-set fixes.
- Scoring calibration: Fair, professional standards. Typical scores fall between 6.5 and 8.6.`;
    }

    const visionPrompt = `You are a master Director of Photography (DP), veteran colourist, and Visual Effects (VFX) supervisor.
Analyze this submitted cinematography still frame according to the specified evaluation tier.
${userNotes ? `User/Filmmaker note: "${userNotes}"` : ''}

${tierInstructions}

Evaluate the shot across these essential cinematic dimensions:
0. Conversational Gut Feeling (How the Shot Feels & Why It Is the Way It Is):
   - Provide an "emotionalImpression": 2-3 sentences of human, dialogue-like commentary in easy-to-grasp, relatable language (adapted to your active tier persona).
   - Talk directly to the filmmaker across the monitor: tell them how the frame strikes you emotionally, what mood it instantly gives off, and why the visual elements were placed or lit this way (e.g. "Honestly, here's how this hits me: you jammed the character against the lower frame edge in deep shadow because you wanted us to feel their isolation before a single word is said. It feels like an interrogation where the walls are sweating.")

1. Composition & Framing:
   - Subject placement, lead room, headroom
   - Rule of thirds, golden ratio, quadrant division, or symmetrical geometry
   - Depth cues (foreground framing, midground, background planes)
   - Lens perspective / apparent focal length (wide distortion vs telephoto compression)

2. Lighting & Exposure:
   - Key-to-fill contrast ratio
   - Quality of light (hard/specular vs diffuse/soft wrap)
   - Highlight retention & shadow falloff (are highlights clipped, are blacks crushed or lifted?)
   - Color temperature harmonies or clashing Kelvin temperatures (e.g. tungsten practical vs cool daylight spill)

3. Color Grading & Palette:
   - Palette cohesiveness and emotional tone
   - Skin tone fidelity (vector-scope line alignment, natural tonality)
   - Lift, gamma, gain balance

4. Visible Artifacts & Technical Cleanliness:
   - Sensor noise vs organic film grain
   - Pixel binning, digital sharpening halos, chromatic aberration
   - Posterization / 8-bit banding in skies or gradients
   - Compression macroblocking

5. CGI / Visual Effects & Compositing Inspection:
   - Look critically at whether any elements appear digitally inserted, simulated, or AI-generated.
   - If CGI/VFX is detected or suspected, specify the CONCRETE physical reasons it reads as fake:
     * Lighting angle or Kelvin mismatch between element and plate
     * Edge aliasing or matte line softness
     * Wrong shadow density or missing contact shadows
     * Scale dissonance or depth of field blur inconsistency
   - If 100% practical / authentic optical photograph, highlight the natural optical physics that prove it.

6. Concrete Actionable Fixes:
   - Provide 2-3 specific, direct instructions for the filmmaker on how they would improve this shot on set or in the colour grade (e.g., specific camera position, diffusion filter, negative fill, lighting flag, grading tweak).

Format your response STRICTLY as JSON with this structure:
{
  "tier": "${selectedTier}",
  "emotionalImpression": "2-3 sentences in conversational, human, dialogue-like language on how the shot feels emotionally and why it is the way it is.",
  "shotClassification": {
    "shotType": "e.g. Medium Close-Up (MCU)",
    "apparentFocalLength": "e.g. ~50mm normal / ~85mm portrait",
    "aspectRatio": "e.g. 2.39:1 widescreen or 16:9",
    "visualTone": "e.g. Neo-Noir, Naturalistic, Melancholic, Sci-Fi High Key"
  },
  "scores": {
    "overall": 8.2,
    "composition": 8.5,
    "lighting": 7.8,
    "color": 8.0,
    "technicalPurity": 8.5
  },
  "compositionFeedback": {
    "summary": "1-2 sentence core assessment in the specified tier tone",
    "strengths": ["...", "..."],
    "critique": "Detailed critique of framing, headroom, balance"
  },
  "lightingFeedback": {
    "summary": "1-2 sentence assessment",
    "strengths": ["...", "..."],
    "critique": "Detailed critique of key, fill, contrast, highlight roll-off"
  },
  "colorGradeFeedback": {
    "summary": "1-2 sentence assessment",
    "palette": ["#...", "#...", "#..."],
    "critique": "Assessment of skin tones, hue separation, saturation"
  },
  "technicalArtifacts": {
    "noiseOrGrain": "Grain analysis (film grain, CMOS noise, or clean)",
    "detectedIssues": ["e.g. Slight chromatic aberration in upper-right corner", "Mild compression artifacts"]
  },
  "vfxInspection": {
    "hasVfxElements": false,
    "assessment": "Detailed reasoning on authenticity or digital artificiality"
  },
  "actionableFixes": [
    "Fix 1: Specific on-set or grading recommendation",
    "Fix 2: Specific lighting or framing modification",
    "Fix 3: Technical adjustment"
  ]
}
Return only JSON.`;

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: safeMime,
      },
    };

    const textPart = {
      text: visionPrompt,
    };

    const response = await generateWithRetry({
      contents: {
        parts: [imagePart, textPart],
      },
      apiKey: extractReqApiKey(req),
    });

    const text = response.text || '';
    const parsed = extractJsonFromText(text);

    if (parsed) {
      parsed.tier = selectedTier;
    }

    recordModelRequest('gemini-3.5-flash-lite');

    res.json({
      rating: parsed,
    });
  } catch (error: any) {
    console.error('Error in /api/shot-rater:', error);
    const retryDelay = extractRetryDelaySeconds(error);
    if (retryDelay) {
      setQuotaCooldown(retryDelay);
    }
    const is429 =
      error?.status === 429 ||
      String(error?.message).includes('429') ||
      String(error?.message).includes('RESOURCE_EXHAUSTED') ||
      String(error?.message).includes('quota');

    res.status(is429 ? 429 : 500).json({
      error: cleanErrorMessage(error),
      retryDelaySeconds: retryDelay,
    });
  }
});

// -------------------------------------------------------------
// 3. Script Lab (Critique or Co-Write in Screenplay Format)
// -------------------------------------------------------------
app.post('/api/script-lab', async (req: Request, res: Response) => {
  try {
    const {
      mode,
      content,
      genre,
      logline,
      budget,
      experienceLevel,
      crewSize,
      customCrewCount,
      tier = 'constructive',
    } = req.body;

    if (!content && !logline) {
      return res.status(400).json({ error: 'Please provide script text, an idea, or a logline.' });
    }

    const effectiveCrew = customCrewCount
      ? `${customCrewCount} crew members (${crewSize || 'Custom'})`
      : crewSize || 'Skeleton Crew (2-4 people)';

    const effectiveBudget = budget || 'Micro-Budget (Under ₹1.5 Lakh / DIY)';
    const effectiveLevel = experienceLevel || 'Independent Film Director';
    const selectedTier = String(tier).toLowerCase();

    if (mode === 'critique') {
      let tierInstructions = '';
      if (selectedTier === 'friendly') {
        tierInstructions = `EVALUATION TIER: FRIENDLY (Encouraging & Supportive)
- Tone: Warm, optimistic, championing the writer's vision. Emphasize character sparks, unique voice, and emotional high points.
- Frame all feedback gently with uplifting, actionable guidance rather than discouraging notes.
- Scoring calibration: Generous and motivating. Typical scores fall between 7.8 and 9.6.`;
      } else if (selectedTier === 'brutal') {
        tierInstructions = `EVALUATION TIER: BRUTAL (Ruthlessly Honest, Acid-Tongued Hollywood Exec)
- Tone: Uncompromising, biting, razor-sharp. Channel a legendary, notoriously exacting studio head who despises on-the-nose exposition, lazy tropes, weak stakes, and flabby scene work.
- Call out clichéd dialogue, unearned melodrama, passive protagonists, and pacing lulls without pulling any punches.
- Scoring calibration: Harsh and hard-won. Flawed drafts get 3.0 - 5.0; decent work gets 5.0 - 6.5; only undeniable masterworks exceed 7.5.`;
      } else if (selectedTier === 'moderate') {
        tierInstructions = `EVALUATION TIER: MODERATE (Objective Studio Reader & Festival Screener)
- Tone: Neutral, matter-of-fact, realistic. Evaluate the draft against standard industry coverage benchmarks.
- No sugar-coating, no undue cynicism—just clear, pragmatic analysis of dramatic momentum, subtext, and market viability.
- Scoring calibration: Realistic benchmark. Typical scores fall between 5.5 and 7.8.`;
      } else {
        // Default: constructive
        tierInstructions = `EVALUATION TIER: CONSTRUCTIVE (Film School Mentor & Veteran Script Doctor)
- Tone: Instructive, balanced, and craft-driven. Focus on dramatic architecture, objectives vs obstacles, subtext, and pacing.
- Give equal weight to what works and pinpoint exact lines to sharpen, explaining WHY.
- Scoring calibration: Fair, professional standard. Typical scores fall between 6.5 and 8.6.`;
      }

      const prompt = `You are an elite script doctor and screenplay development consultant.
Review the following screenplay excerpt or scene draft strictly according to the designated evaluation tier:

${tierInstructions}

GENRE CONTEXT: ${genre || 'Unspecified'}
LOGLINE / PREMISE: ${logline || 'None provided'}

SCRIPT TEXT:
"""
${content}
"""

Evaluate the submission thoroughly across these dimensions:
1. Structure & Dramatic Tension:
   - Does the scene have a clear objective, obstacle, and turning point (a beat where power shifts or status changes)?
   - Pacing, momentum, and cause-and-effect progression.
2. Dialogue & Subtext:
   - Do characters speak in on-the-nose exposition, or is there rich subtext?
   - Distinct voice and cadence per character.
3. Visual Storytelling & Action Beats:
   - "Show, don't tell": Are action lines evocative, present-tense, and filmable?
   - Are character emotions dramatized through behavior rather than internal descriptions?
4. Industry Screenplay Formatting:
   - Adherence to standard sluglines (INT./EXT. LOCATION - TIME), character cue conventions, parenthetical restraint, and brevity.
5. Specific Line-by-Line Polish Suggestions:
   - Pinpoint 2-3 specific lines of dialogue or action blocks that can be sharpened.

Return your evaluation as a structured JSON object:
{
  "tier": "${selectedTier}",
  "executiveSummary": "A concise 2-3 sentence overview of the scene's impact and commercial/artistic viability in the selected tier tone.",
  "score": {
    "overall": 8.0,
    "dialogue": 8.2,
    "pacing": 7.5,
    "formatting": 8.5
  },
  "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
  "criticalWeaknesses": ["Weakness 1", "Weakness 2"],
  "formattingNotes": "Observations on screenplay formatting adherence.",
  "subtextAndDialogueCritique": "Deep-dive on dialogue naturalism and subtext.",
  "actionableRevisions": [
    {
      "originalBeat": "Quote or reference from original",
      "critique": "Why it falters",
      "suggestedRewrite": "Sharpened alternative"
    }
  ]
}
Return only JSON.`;

      const response = await generateWithRetry({
        contents: prompt,
        apiKey: extractReqApiKey(req),
      });

      const parsed = extractJsonFromText(response.text || '');
      if (parsed) {
        parsed.tier = selectedTier;
      }
      return res.json({ result: parsed, mode: 'critique' });
    } else {
      // Co-write mode: PROPER, FAST-MOVING STORY (WHAT HAPPENS TO WHOM & WHICH EVENTS PROCEED)
      const prompt = `You are a master cinematic storyteller and narrative screenwriter.
Your goal is to co-write an ENGAGING, ACTION-PACKED, EVENT-DRIVEN CINEMATIC STORY AND DETAILED EVENT PROGRESSION OUTLINE based on the user's concept.

CRITICAL DIRECTIVE ON STYLE & TONE (NO PASSIVE SCENERY OR PHILOSOPHICAL WAXING):
- Write a PROPER STORY detailing WHAT HAPPENS TO WHOM, WHICH EVENTS PROCEED, and HOW THE PLOT ADVANCES STEP-BY-STEP.
- AVOID overly descriptive, philosophical, ambient, or intimate navel-gazing. Do not linger describing the lighting, scenery, or internal emotional musings.
- Instead, drive the narrative forward incident by incident, cause and effect:
  * Clearly establish who the characters are, what urgent objective they pursue, and who or what stands in their way.
  * Every single paragraph MUST feature an external action, a decision, a confrontation, a discovery, or an escalating event that forces the next incident to proceed.
  * Characters speak crisply and take decisive physical actions.

GENRE: ${genre || 'Drama / Thriller'}
LOGLINE / PREMISE: ${logline || 'Cinematic tension'}
USER'S PROMPT OR STARTING CONCEPT:
"""
${content}
"""

WRITER'S PRODUCTION & RESOURCE CONSTRAINTS (ALL MONETARY IN RUPEES ₹):
- Budget Limit: ${effectiveBudget} (Indian Rupees - calculate and stay strictly within this financial envelope)
- Experience / Production Level: ${effectiveLevel}
- Crew Headcount / Size: ${effectiveCrew}

STRICT STORY FORMAT (NO SCRIPT DIALOGUE MARGINS):
Part 1: THE EVENT-DRIVEN STORY
- Write the story as a compelling narrative treatment that propels forward:
  * Event 1 strikes: Character A initiates an action or a sudden incident forces them to act.
  * Immediate reaction & complication: What goes wrong, what obstacle blocks them, what action Character B takes in response.
  * The crisis / turning point: A concrete incident occurs (a secret is revealed, a physical threat explodes, a deadline expires, or power shifts).
  * The climax: The direct showdown or decisive action where stakes collide.
  * Aftermath: Exactly what happened to whom, and the permanent new reality for each character.

Part 2: STRUCTURED EVENT PROGRESSION OUTLINE
- Break down the sequence of chronological events:
  * Event 1: The Inciting Action (Who does what to kick off the plot)
  * Event 2: Escalation & Conflict (The obstacle that strikes and the counter-action taken)
  * Event 3: The Turning Point / Midpoint Shocker (The critical event where everything changes)
  * Event 4: Climax & Clashing Action (The peak conflict and resolution)
  * Event 5: Aftermath & Consequences (What happens to each character in the end)

STAY RIGIDLY IN RUPEE BUDGET & CREW LIMITATIONS:
- If Budget is Micro/DIY (Under ₹1.5 Lakh) or Skeleton Crew (1-4 people): Confine the story to 1-2 accessible, controllable locations and 2-3 characters, relying on psychological tension and propulsive plot events rather than costly stunts.
- If Budget is higher (₹10 Lakh - ₹5 Crore+), scale the practical scope while keeping every event grounded and causal.

Return your response in JSON format:
{
  "sceneTitle": "Evocative Title or Concept Name",
  "loglineRefinement": "Sharpened 1-sentence logline focusing on character and action",
  "storyAndOutline": "Full engaging event-driven story detailing what happens to whom, followed by the structured Event Progression Outline (with Event 1, Event 2, Event 3, Event 4, Event 5 headers)...",
  "dramaticAnalysis": "1-2 concise paragraphs explaining the plot mechanics, character motivations, and how each event logically triggers the next.",
  "directorNote": "A direct technical note for the director on camera pacing, scene rhythm, blocking, and lens choices to keep the story moving relentlessly.",
  "productionConstraintsMet": {
    "budgetAssessment": "Specific breakdown of estimated costs in Indian Rupees (₹) demonstrating how this stays strictly within the ${effectiveBudget} limit.",
    "crewLogisticsPlan": "Clear, practical plan for how a ${effectiveCrew} crew can realistically shoot these story events.",
    "castAndLocationFeasibility": "Summary of cast headcount and location containment."
  }
}
Return only JSON.`;

      const response = await generateWithRetry({
        contents: prompt,
        apiKey: extractReqApiKey(req),
      });

      const parsed = extractJsonFromText(response.text || '');
      if (parsed) {
        // Ensure backwards compatibility with any UI elements referencing screenplayText
        if (parsed.storyAndOutline && !parsed.screenplayText) {
          parsed.screenplayText = parsed.storyAndOutline;
        } else if (parsed.screenplayText && !parsed.storyAndOutline) {
          parsed.storyAndOutline = parsed.screenplayText;
        }
      }
      recordModelRequest('gemini-3.5-flash-lite');
      return res.json({ result: parsed, mode: 'cowrite' });
    }
  } catch (error: any) {
    console.error('Error in /api/script-lab:', error);
    const retryDelay = extractRetryDelaySeconds(error);
    if (retryDelay) {
      setQuotaCooldown(retryDelay);
    }
    const is429 =
      error?.status === 429 ||
      String(error?.message).includes('429') ||
      String(error?.message).includes('RESOURCE_EXHAUSTED') ||
      String(error?.message).includes('quota');

    res.status(is429 ? 429 : 500).json({
      error: cleanErrorMessage(error),
      retryDelaySeconds: retryDelay,
    });
  }
});

// -------------------------------------------------------------
// 4. Gear Suggestor (Search Grounded, INR Prices, Real Links)
// -------------------------------------------------------------
app.post('/api/gear-suggestor', async (req: Request, res: Response) => {
  try {
    const { budgetINR, gearType, brandPreference, shootType } = req.body;

    if (!budgetINR || !gearType) {
      return res.status(400).json({ error: 'Please provide both a budget in INR and a gear type.' });
    }

    const brandClause = brandPreference ? `Preferred Brand: ${brandPreference}.` : '';
    const shootClause =
      shootType && shootType !== 'No specific case'
        ? `Shoot context: ${shootType} (tailor recommendations, form factor, ergonomics, and reliability specifically to this scenario).`
        : `Shoot context: General versatile filmmaking (no specific case/constraint; prioritize all-around versatile, balanced filmmaking utility).`;

    const prompt = `You are a professional film gear expert and camera equipment technician based in India.
Use Google Search to find 3 to 4 REAL, CURRENTLY AVAILABLE filmmaker products in India that match this exact specification:
- Budget: approximately ₹${Number(budgetINR).toLocaleString('en-IN')} INR
- Gear Category: ${gearType} (e.g. cinema camera, gimbal, audio recorder/mic, anamorphic lens, lighting kit, drone, monitor)
- ${brandClause}
- ${shootClause}

CRITICAL RULES:
1. Every product MUST be a real, currently manufactured and sold product in India. Never invent a product name, price, or specification.
2. Prices must be genuine current market prices in Indian Rupees (INR, ₹).
3. Find and provide real direct links to purchase listings, with top priority given to Amazon.in (e.g. amazon.in/dp/...) and Flipkart.com, or official authorized Indian distributor stores (e.g. Sony India, Rode India, Godox India, DJI India, B&H/authorized Indian importers).
4. For each product, explain in 1-2 sharp lines why it specifically fits an indie filmmaker's needs within this budget limit.

Return your response STRICTLY as a JSON object:
{
  "gearCategory": "${gearType}",
  "budgetINR": ${Number(budgetINR)},
  "summary": "1-2 sentence overview of the current Indian market landscape for this budget and category",
  "products": [
    {
      "name": "Exact Real Product Model Name",
      "brand": "Manufacturer Name",
      "approxPriceINR": "₹...",
      "whyItFits": "1-2 lines on why this is the premier pick for this exact budget and filmmaking workflow",
      "keySpecs": ["Spec 1", "Spec 2", "Spec 3", "Spec 4"],
      "directLink": "https://www.amazon.in/... or https://www.flipkart.com/... or verified official store URL",
      "storeName": "Amazon India / Flipkart / Official Store",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Trade-off / Cons to consider"]
    }
  ]
}
Return only JSON.`;

    const response = await generateWithRetry({
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
      apiKey: extractReqApiKey(req),
    });

    const text = response.text || '';
    let parsed: any;
    try {
      parsed = extractJsonFromText(text);
    } catch (e) {
      parsed = {
        gearCategory: gearType,
        budgetINR: Number(budgetINR),
        summary: 'Researched gear options matching your budget.',
        products: [],
      };
    }

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri && typeof w.uri === 'string' && w.uri.startsWith('http'))
      .map((w: any) => ({
        title: w.title || 'Market Listing Source',
        uri: w.uri,
      }));

    // CRITICAL: Prevent dead / hallucinated product links.
    // Only show a link that comes from the actual grounding citations returned by the API.
    // When no solid citation link exists, fall back to a proper Amazon.in / Flipkart search-results link.
    if (parsed.products && Array.isArray(parsed.products)) {
      parsed.products = parsed.products.map((prod: any) => {
        const prodName = (prod.name || '').trim();
        const prodTokens = prodName
          .toLowerCase()
          .split(/[\s-]+/)
          .filter((t: string) => t.length > 2);

        // Find if any citation returned by Google Search grounding matches this product
        const matchedCitation = sources.find((src: any) => {
          const uri = (src.uri || '').toLowerCase();
          const title = (src.title || '').toLowerCase();
          const matchCount = prodTokens.filter(
            (token: string) => uri.includes(token) || title.includes(token)
          ).length;
          return matchCount >= Math.min(2, prodTokens.length);
        });

        let directLink: string;
        let isDirectListing = false;
        let storeName = 'Amazon India Search';

        if (matchedCitation && matchedCitation.uri) {
          directLink = matchedCitation.uri;
          isDirectListing = true;
          storeName = matchedCitation.uri.includes('flipkart.com')
            ? 'Flipkart Verified Listing'
            : 'Amazon India Verified Listing';
        } else {
          // Guaranteed real live search-results page built from product name
          directLink = `https://www.amazon.in/s?k=${encodeURIComponent(prodName)}`;
          storeName = 'Amazon India';
        }

        const flipkartSearchLink = `https://www.flipkart.com/search?q=${encodeURIComponent(prodName)}`;

        return {
          ...prod,
          directLink,
          isDirectListing,
          storeName,
          searchFallbackLink: flipkartSearchLink,
        };
      });
    }

    recordModelRequest('gemini-3.1-flash-lite');

    res.json({
      gearData: parsed,
      sources: sources.slice(0, 8),
      searchQueries,
    });
  } catch (error: any) {
    console.error('Error in /api/gear-suggestor:', error);
    const retryDelay = extractRetryDelaySeconds(error);
    if (retryDelay) {
      setQuotaCooldown(retryDelay);
    }
    const is429 =
      error?.status === 429 ||
      String(error?.message).includes('429') ||
      String(error?.message).includes('RESOURCE_EXHAUSTED') ||
      String(error?.message).includes('quota');

    res.status(is429 ? 429 : 500).json({
      error: cleanErrorMessage(error),
      retryDelaySeconds: retryDelay,
    });
  }
});

// -------------------------------------------------------------
// 5. Editor Advisor (Match software to device specs, workflow & budget)
// -------------------------------------------------------------
const EDITOR_KNOWN_LOGOS: Record<string, { logo: string; site: string; defaultSize: string }> = {
  'davinci resolve': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png',
    site: 'https://www.blackmagicdesign.com/products/davinciresolve',
    defaultSize: '~2.8 GB installer',
  },
  'davinci resolve studio': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png',
    site: 'https://www.blackmagicdesign.com/products/davinciresolve',
    defaultSize: '~2.8 GB installer',
  },
  'premiere pro': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Adobe_Premiere_Pro_CC_icon.svg',
    site: 'https://www.adobe.com/products/premiere.html',
    defaultSize: '~1.5 GB base + cache',
  },
  'adobe premiere pro': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Adobe_Premiere_Pro_CC_icon.svg',
    site: 'https://www.adobe.com/products/premiere.html',
    defaultSize: '~1.5 GB base + cache',
  },
  'final cut pro': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/7/7b/Final_Cut_Pro_logo.png',
    site: 'https://www.apple.com/final-cut-pro/',
    defaultSize: '~3.4 GB',
  },
  'final cut pro x': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/7/7b/Final_Cut_Pro_logo.png',
    site: 'https://www.apple.com/final-cut-pro/',
    defaultSize: '~3.4 GB',
  },
  'capcut': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Capcut-icon.png',
    site: 'https://www.capcut.com/',
    defaultSize: '~650 MB',
  },
  'capcut desktop': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Capcut-icon.png',
    site: 'https://www.capcut.com/',
    defaultSize: '~650 MB',
  },
  'shotcut': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Shotcut-logo-64x64.png',
    site: 'https://shotcut.org/download/',
    defaultSize: '~95 MB',
  },
  'kdenlive': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Kdenlive_logo.svg',
    site: 'https://kdenlive.org/en/download/',
    defaultSize: '~110 MB',
  },
  'hitfilm': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/HitFilm_Express_Logo.png',
    site: 'https://fxhome.com/product/hitfilm',
    defaultSize: '~500 MB',
  },
  'filmora': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Wondershare_Filmora_Icon_2020.png',
    site: 'https://filmora.wondershare.com/',
    defaultSize: '~550 MB',
  },
  'wondershare filmora': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Wondershare_Filmora_Icon_2020.png',
    site: 'https://filmora.wondershare.com/',
    defaultSize: '~550 MB',
  },
  'avid media composer': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/6/66/Avid_Media_Composer_Icon.png',
    site: 'https://www.avid.com/media-composer',
    defaultSize: '~3.1 GB',
  },
  'blender': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/Blender_logo_no_text.svg',
    site: 'https://www.blender.org/download/',
    defaultSize: '~310 MB',
  },
  'lumafusion': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/a/a2/LumaFusion_App_Icon.png',
    site: 'https://luma-touch.com/lumafusion-for-ios-2/',
    defaultSize: '~180 MB',
  },
  'kinemaster': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ec/KineMaster_logo.png',
    site: 'https://www.kinemaster.com/',
    defaultSize: '~110 MB',
  },
  'alight motion': {
    logo: '',
    site: 'https://alightcreative.com/',
    defaultSize: '~140 MB',
  },
  'vn video editor': {
    logo: '',
    site: 'https://vlognow.me/',
    defaultSize: '~250 MB',
  },
  'inshot': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/InShot_logo.png',
    site: 'https://inshot.com/',
    defaultSize: '~85 MB',
  },
  'blackmagic camera': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png',
    site: 'https://www.blackmagicdesign.com/products/blackmagiccamera',
    defaultSize: '~95 MB',
  },
  'davinci resolve for ipad': {
    logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png',
    site: 'https://www.blackmagicdesign.com/products/davinciresolve/ipad',
    defaultSize: '~2.1 GB',
  },
  'final cut pro for ipad': {
    logo: 'https://upload.wikimedia.org/wikipedia/en/7/7b/Final_Cut_Pro_logo.png',
    site: 'https://www.apple.com/final-cut-pro-for-ipad/',
    defaultSize: '~1.1 GB',
  },
};

function matchEditorLogoAndUrl(editorName: string): { logoUrl: string | null; downloadUrl: string; downloadSize: string } {
  const norm = editorName.toLowerCase().trim();
  for (const [key, val] of Object.entries(EDITOR_KNOWN_LOGOS)) {
    if (norm.includes(key) || key.includes(norm)) {
      return {
        logoUrl: val.logo,
        downloadUrl: val.site,
        downloadSize: val.defaultSize,
      };
    }
  }
  return {
    logoUrl: null,
    downloadUrl: `https://duckduckgo.com/?q=${encodeURIComponent(editorName + ' official download')}`,
    downloadSize: '~400 MB',
  };
}

app.post('/api/editor-advisor', async (req: Request, res: Response) => {
  try {
    const {
      deviceCategory,
      os,
      cpuGpu,
      ramGB,
      vram,
      hasDedicatedGPU,
      editWorkflow,
      pricingPreference,
      learningCurvePreference,
      sourceFootageType,
    } = req.body;

    const vramInfo = vram ? `- GPU VRAM / Video Memory: ${vram}` : '';

    const prompt = `You are a legendary post-production supervisor, master colorist, and mobile/desktop technical editor.
Your objective is to advise a creator on the absolute BEST video editing software or mobile editor tailored specifically to their computer, smartphone, or tablet hardware constraints, processor architecture (including Apple A-series bionic, Snapdragon, MediaTek Dimensity, Intel, AMD, Apple Silicon M-series), editing workflow, budget/pricing model, and time available for learning.

USER SPECIFICATIONS & HARDWARE:
- Device Category: ${deviceCategory || 'Laptop / Desktop PC'}
- Operating System: ${os || 'Windows 11 / macOS / Linux / iOS / Android'}
- Processor & GPU: ${cpuGpu || 'Integrated graphics / Standard modern CPU / Mobile SoC'}
- RAM: ${ramGB ? `${ramGB} GB RAM (or unified memory)` : '16 GB RAM'}
${vramInfo}
- Dedicated Discrete GPU / Neural Engine: ${hasDedicatedGPU ? 'Yes (discrete VRAM or dedicated high-tier GPU/NPU)' : 'No (integrated GPU / mobile SoC)'}
- Type of Edits / Workflow: ${editWorkflow || 'Shorts, Reels, YouTube & Cinematic Storytelling'}
- Pricing Preference: ${pricingPreference || 'Free or Pay Once preferred'}
- Learning Curve Willingness: ${learningCurvePreference || 'Intermediate'}
- Source Footage / Resolution: ${sourceFootageType || '1080p to 4K H.264/H.265 / Log'}

CRITICAL INSTRUCTIONS:
1. Ground your recommendations on REAL video editors:
   - For DESKTOP: DaVinci Resolve, Adobe Premiere Pro, Final Cut Pro, CapCut Desktop, Shotcut, Kdenlive, Wondershare Filmora, Avid Media Composer, Blender VSE.
   - For MOBILE (iOS/Android/iPadOS with Apple A15/A16/A17/A18, Snapdragon 8 Gen 1/2/3, Dimensity, Tensor): VN Video Editor, CapCut Mobile, LumaFusion (iOS/Android), DaVinci Resolve for iPad, Final Cut Pro for iPad, KineMaster, Alight Motion (for motion graphics & anime edits), InShot.
2. HARDWARE & VRAM FEASIBILITY CHECK:
   - Factor in VRAM: DaVinci Resolve requires at least 4GB-6GB VRAM for 4K timelines and 8GB+ VRAM for complex Fusion/color grading without 'GPU Memory Full' errors. If user has low VRAM (2GB-4GB) or integrated/shared memory, warn them and recommend proxy workflows or memory-efficient suites like CapCut Desktop, Premiere Pro with Metal/CUDA, Shotcut, or Kdenlive.
   - If Mobile Phone (Apple A-series or Snapdragon 8-series / Dimensity): Highlight hardware H.265 hardware decoders, multi-track 4K 60fps ProRes/Log support, and heat throttling tradeoffs. Highly recommend VN Editor (free, clean, multi-track, LUT support) or CapCut Mobile, or LumaFusion for pro cuts.
   - If user has <= 8GB RAM on PC or no discrete GPU, WARNING: DaVinci Resolve will likely crash or stutter on 4K; recommend lightweight champions like Shotcut, CapCut Desktop, or Kdenlive alongside proxies.
   - If user has Apple Silicon (M1/M2/M3/M4) or 16GB+ / 24GB+ / 32GB+ RAM, Final Cut Pro or DaVinci Resolve are premier beasts. Notice uneven RAM configurations (e.g. 24GB, 20GB, 12GB) and acknowledge their asymmetric multi-channel headroom.
   - If user prefers "Free / Open Source", pick 100% free software without watermarks (e.g., VN Video Editor for mobile, Kdenlive/Shotcut for PC).
   - If user prefers "Pay Once", feature tools like Final Cut Pro, LumaFusion ($29.99 lifetime), DaVinci Resolve Studio, or Filmora Perpetual.
   - If user prefers "Subscription", mention Premiere Pro or Final Cut Pro iPad.
3. Recommend:
   - 1 TOP PICK (The undisputed champion for this exact configuration)
   - 2 to 3 ALTERNATIVES (e.g. One ultra-lightweight option, one high-end pro alternative, or one quick-turnaround social option).
4. Output STRICTLY as a single JSON object with this schema:
{
  "deviceSpecsAnalyzed": "Brief technical summary of their hardware bottleneck or advantage",
  "editWorkflow": "Workflow context",
  "executiveSummary": "2-3 sentences of direct, compassionate advice explaining why the top pick was chosen for this exact machine",
  "topPick": {
    "name": "Software Name",
    "tagline": "Short punchy description",
    "pricingModel": "Free / Open Source" | "Pay Once" | "Subscription" | "Freemium",
    "priceDisplay": "e.g. 100% Free (No Watermark) or $299 One-time or $22.99/mo",
    "learningCurve": "Beginner / Instant" | "Intermediate" | "Advanced / Professional",
    "downloadSizeApprox": "e.g. ~2.8 GB installer or ~95 MB",
    "supportedPlatforms": ["Windows", "macOS", "Linux"],
    "systemRequirementsSummary": "Minimum: 16GB RAM, Recommended: Dedicated 4GB+ GPU",
    "hardwareFitVerdict": "Perfect Match" | "Runs Well" | "Needs Optimization / Proxies" | "Minimum Fit",
    "whyItFits": "Detailed 2-3 sentence technical justification connecting their RAM, GPU, and footage type to this software",
    "pros": ["Pro 1", "Pro 2", "Pro 3"],
    "cons": ["Con 1", "Con 2"],
    "officialDownloadUrl": "https://...",
    "bestForEditingStyle": "e.g. Long-form narrative films & Hollywood grade coloring"
  },
  "alternatives": [
    {
      "name": "Software Name",
      "tagline": "Tagline",
      "pricingModel": "Free / Open Source" | "Pay Once" | "Subscription" | "Freemium",
      "priceDisplay": "Price",
      "learningCurve": "Beginner / Instant" | "Intermediate" | "Advanced / Professional",
      "downloadSizeApprox": "~500 MB",
      "supportedPlatforms": ["Windows", "macOS"],
      "systemRequirementsSummary": "Specs summary",
      "hardwareFitVerdict": "Runs Well",
      "whyItFits": "Why this alternative is great if they want a different tradeoff",
      "pros": ["Pro 1", "Pro 2"],
      "cons": ["Con 1"],
      "officialDownloadUrl": "https://...",
      "bestForEditingStyle": "Shorts & fast social cuts"
    }
  ]
}
Return only JSON.`;

    const response = await generateWithRetry({
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
      apiKey: extractReqApiKey(req),
    });

    const parsed = extractJsonFromText(response.text || '');

    // Enrich top pick and alternatives with verified logos, official URLs and download sizes
    if (parsed && parsed.topPick) {
      const enrich = matchEditorLogoAndUrl(parsed.topPick.name);
      if (!parsed.topPick.logoUrl && enrich.logoUrl) {
        parsed.topPick.logoUrl = enrich.logoUrl;
      }
      if (!parsed.topPick.officialDownloadUrl || parsed.topPick.officialDownloadUrl.includes('duckduckgo')) {
        parsed.topPick.officialDownloadUrl = enrich.downloadUrl;
      }
      if (!parsed.topPick.downloadSizeApprox) {
        parsed.topPick.downloadSizeApprox = enrich.downloadSize;
      }
    }

    if (parsed && parsed.alternatives && Array.isArray(parsed.alternatives)) {
      parsed.alternatives = parsed.alternatives.map((alt: any) => {
        const enrich = matchEditorLogoAndUrl(alt.name);
        return {
          ...alt,
          logoUrl: alt.logoUrl || enrich.logoUrl,
          officialDownloadUrl: alt.officialDownloadUrl && !alt.officialDownloadUrl.includes('duckduckgo')
            ? alt.officialDownloadUrl
            : enrich.downloadUrl,
          downloadSizeApprox: alt.downloadSizeApprox || enrich.downloadSize,
        };
      });
    }

    // Extract grounding citations
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri)
      .map((w: any) => ({
        title: w.title || 'Source Citation',
        uri: w.uri,
      }));

    recordModelRequest('gemini-3.1-flash-lite');

    res.json({
      advisorResult: parsed,
      sources: sources.slice(0, 5),
      searchQueries,
    });
  } catch (error: any) {
    console.error('Error in /api/editor-advisor:', error);
    const retryDelay = extractRetryDelaySeconds(error);
    if (retryDelay) {
      setQuotaCooldown(retryDelay);
    }
    const is429 =
      error?.status === 429 ||
      String(error?.message).includes('429') ||
      String(error?.message).includes('RESOURCE_EXHAUSTED') ||
      String(error?.message).includes('quota');

    res.status(is429 ? 429 : 500).json({
      error: cleanErrorMessage(error),
      retryDelaySeconds: retryDelay,
    });
  }
});

// -------------------------------------------------------------
// 6. StutterFrame Assistant (Fast Flash-Lite Streaming Chatbot)
// -------------------------------------------------------------
app.post('/api/assistant/stream', async (req: Request, res: Response) => {
  try {
    const { messages, forceSearch } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Please provide messages array.' });
    }

    const latestMessage = messages[messages.length - 1].content || '';

    const needsGrounding =
      forceSearch === true ||
      /(price|cost|inr|amazon|flipkart|buy|current|latest|2024|2025|2026|newest|release date|box office|who won|specs for|review of recent)/i.test(
        latestMessage
      );

    const systemInstruction = `You are the StutterFrame Assistant — an elite cinematic mentor, technical advisor, and conversational companion for filmmakers, screenwriters, and cinephiles.
Your persona: Deeply knowledgeable in directing, cinematography (lighting ratios, focal lengths, camera sensor technologies, color science), screenplay craft, and post-production.
Tone: Articulate, inspiring, precise, and practical. Avoid fluff; give real-world film production advice with concrete examples from film history and modern cinema.
If formatting screenplay snippets, use Courier font style.
Keep responses concise, scannable, and rapid.`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Setup SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const config: any = {
      systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MINIMAL,
      },
    };

    if (needsGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    // Call Flash-Lite model for fast lightweight conversational chat with minimal thinking
    const responseStream = callGeminiStreamREST(FAST_CHAT_MODEL, contents, config, extractReqApiKey(req));

    let sources: any[] = [];

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
      const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        sources = chunks
          .map((c: any) => c.web)
          .filter((w: any) => w && w.uri)
          .map((w: any) => ({
            title: w.title || 'Source Citation',
            uri: w.uri,
          }));
      }
    }

    res.write(
      `data: ${JSON.stringify({
        done: true,
        grounded: needsGrounding,
        sources: sources.slice(0, 5),
      })}\n\n`
    );
    res.end();
  } catch (error: any) {
    console.error('Error in /api/assistant/stream:', error);
    res.write(
      `data: ${JSON.stringify({
        error: error?.message || 'Streaming failed. Please retry.',
      })}\n\n`
    );
    res.end();
  }
});

// Non-streaming fallback for /api/assistant using Flash-Lite and minimal thinking
app.post('/api/assistant', async (req: Request, res: Response) => {
  try {
    const { messages, forceSearch } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Please provide messages array.' });
    }

    const latestMessage = messages[messages.length - 1].content || '';

    const needsGrounding =
      forceSearch === true ||
      /(price|cost|inr|amazon|flipkart|buy|current|latest|2024|2025|2026|newest|release date|box office|who won|specs for|review of recent)/i.test(
        latestMessage
      );

    const systemInstruction = `You are the StutterFrame Assistant — an elite cinematic mentor, technical advisor, and conversational companion for filmmakers, screenwriters, and cinephiles.
Your persona: Deeply knowledgeable in directing, cinematography (lighting ratios, focal lengths, camera sensor technologies, color science), screenplay craft, and post-production.
Tone: Articulate, inspiring, precise, and practical. Avoid fluff; give real-world film production advice with concrete examples from film history and modern cinema.
If formatting screenplay snippets, use Courier font style.
Keep responses concise, scannable, and engaging.`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const config: any = {
      systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.MINIMAL,
      },
    };

    if (needsGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await callGeminiREST(FAST_CHAT_MODEL, contents, config, extractReqApiKey(req));

    const replyText = response.text || '';
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => c.web)
      .filter((w: any) => w && w.uri)
      .map((w: any) => ({
        title: w.title || 'Source Citation',
        uri: w.uri,
      }));

    res.json({
      reply: replyText,
      grounded: needsGrounding,
      sources: sources.slice(0, 5),
    });
  } catch (error: any) {
    console.error('Error in /api/assistant:', error);
    const retryDelay = extractRetryDelaySeconds(error);
    if (retryDelay) {
      setQuotaCooldown(retryDelay);
    }
    const is429 =
      error?.status === 429 ||
      String(error?.message).includes('429') ||
      String(error?.message).includes('RESOURCE_EXHAUSTED') ||
      String(error?.message).includes('quota');

    res.status(is429 ? 429 : 500).json({
      error: cleanErrorMessage(error),
      retryDelaySeconds: retryDelay,
    });
  }
});

// -------------------------------------------------------------
// 6. Live Quota & Prompt Tracker Status
// -------------------------------------------------------------
app.get('/api/quota', (_req: Request, res: Response) => {
  res.json(getQuotaStatus());
});

// -------------------------------------------------------------
// 7. Health Check for Vercel / Cloud Run Monitoring
// -------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'StutterFrame Cinema Toolkit', timestamp: Date.now() });
});

// -------------------------------------------------------------
// Vite Middleware / Static File Serving Setup
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(appDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 StutterFrame server running on port ${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

// Global error handler to guarantee clear JSON output and prevent function crashes
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Express serverless error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: err?.message || 'Server error processing request.',
    });
  }
});

// Only start the HTTP listener when running as a standalone node process (not in Vercel serverless)
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  });
}

export default app;
export { app };
