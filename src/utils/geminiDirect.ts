import { ShotRatingResult, CritiqueTier } from '../types';
import { getStoredApiKey } from './api';

function extractJson(text: string): any {
  if (!text) return null;
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonStr = match ? match[1] : text;
  try {
    return JSON.parse(jsonStr.trim());
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {}
    }
    return null;
  }
}

export async function directAnalyzeShot(params: {
  imageBase64: string;
  mimeType?: string;
  userNotes?: string;
  tier?: CritiqueTier;
  apiKey?: string;
}): Promise<ShotRatingResult> {
  const apiKey = params.apiKey || getStoredApiKey();
  if (!apiKey) {
    throw new Error('Google Gemini API key is missing. Please enter your Gemini API key.');
  }

  const cleanBase64 = params.imageBase64.replace(/^data:image\/\w+;base64,/, '');
  let safeMime = (params.mimeType || 'image/jpeg').toLowerCase();
  if (safeMime === 'image/jpg') safeMime = 'image/jpeg';

  const selectedTier = (params.tier || 'constructive').toLowerCase();

  let tierInstructions = '';
  if (selectedTier === 'friendly') {
    tierInstructions = `EVALUATION TIER: FRIENDLY (Encouraging & Generous)
- Tone: Uplifting, affirmative, and encouraging. Focus heavily on what the filmmaker did right.
- Calibrate numeric scores generously: typical scores should fall between 7.8 and 9.6.`;
  } else if (selectedTier === 'brutal') {
    tierInstructions = `EVALUATION TIER: BRUTAL (Uncompromising, Ruthlessly Honest & Exacting)
- Tone: Unapologetic, razor-sharp, zero sugar-coating. Speak like an exacting master DP.
- Calibrate numeric scores harshly: average work gets 3.0 - 5.0; decent indie work sits at 5.0 - 6.5.`;
  } else if (selectedTier === 'moderate') {
    tierInstructions = `EVALUATION TIER: MODERATE (Objective Industry Screener)
- Tone: Neutral, matter-of-fact, balanced. Evaluate framing geometry, lighting ratios, and color grading.
- Calibrate numeric scores realistically: typical scores should fall between 5.5 and 7.8.`;
  } else {
    tierInstructions = `EVALUATION TIER: CONSTRUCTIVE (Film School Mentor & Masterclass DP Leader)
- Tone: Instructive, professional, pedagogical, and craft-centered.
- Scoring calibration: Fair, professional standards. Typical scores fall between 6.5 and 8.6.`;
  }

  const visionPrompt = `You are a master Director of Photography (DP), veteran colourist, and Visual Effects (VFX) supervisor.
Analyze this submitted cinematography still frame according to the specified evaluation tier.
${params.userNotes ? `User/Filmmaker note: "${params.userNotes}"` : ''}

${tierInstructions}

Evaluate the shot across these essential cinematic dimensions:
0. Conversational Gut Feeling: Provide an "emotionalImpression" (2-3 sentences of human dialogue on how the shot feels emotionally and why it was framed/lit this way).
1. Composition & Framing (lead room, headroom, rule of thirds, depth planes, apparent focal length).
2. Lighting & Exposure (contrast ratio, key/fill, highlight roll-off, shadow detail, Kelvin temperatures).
3. Color Grading & Palette (skin tone fidelity, palette harmony, lift/gamma/gain).
4. Visible Artifacts (noise vs grain, chromatic aberration, banding, compression).
5. VFX / Authenticity Inspection (detect CGI, AI-generation, composite edges or practical optical proof).
6. 2-3 Concrete Actionable Fixes for on set or colour grade.

Format your response STRICTLY as JSON with this structure:
{
  "tier": "${selectedTier}",
  "emotionalImpression": "2-3 sentences in conversational dialogue.",
  "shotClassification": {
    "shotType": "e.g. Medium Close-Up (MCU)",
    "apparentFocalLength": "e.g. ~50mm normal",
    "aspectRatio": "e.g. 2.39:1 widescreen or 16:9",
    "visualTone": "e.g. Neo-Noir, Naturalistic"
  },
  "scores": {
    "overall": 8.2,
    "composition": 8.5,
    "lighting": 7.8,
    "color": 8.0,
    "technicalPurity": 8.5
  },
  "compositionFeedback": {
    "summary": "1-2 sentence core assessment",
    "strengths": ["...", "..."],
    "critique": "Detailed critique of framing"
  },
  "lightingFeedback": {
    "summary": "1-2 sentence assessment",
    "strengths": ["...", "..."],
    "critique": "Detailed critique of lighting"
  },
  "colorGradeFeedback": {
    "summary": "1-2 sentence assessment",
    "palette": ["#...", "#...", "#..."],
    "critique": "Assessment of color"
  },
  "technicalArtifacts": {
    "noiseOrGrain": "Grain analysis",
    "detectedIssues": ["..."]
  },
  "vfxInspection": {
    "hasVfxElements": false,
    "assessment": "Reasoning on authenticity"
  },
  "actionableFixes": [
    "Fix 1: Recommendation",
    "Fix 2: Recommendation"
  ]
}
Return only JSON.`;

  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: safeMime,
                  },
                },
                {
                  text: visionPrompt,
                },
              ],
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `Google API status ${res.status}`);
      }

      const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
      const parsed = extractJson(text);
      if (!parsed) {
        throw new Error('Failed to parse cinematography evaluation JSON.');
      }
      parsed.tier = selectedTier;
      return parsed;
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('Direct Gemini Vision evaluation failed. Please verify your API key.');
}
