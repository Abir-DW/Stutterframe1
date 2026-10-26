import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Sliders,
  Sun,
  Palette,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Image as ImageIcon,
  Edit3,
  ShieldAlert,
  Flame,
  Scale,
  Smile,
  MessageSquareQuote,
  Send,
  MessageSquare,
  DollarSign,
  Wrench,
  Lightbulb,
  Coins,
  Bot,
} from 'lucide-react';
import { ShotRatingResult, CritiqueTier } from '../types';
import { ResearchingIndicator, ErrorState } from './ResearchingIndicator';
import { fetchWithAuth, getStoredApiKey } from '../utils/api';
import { directAnalyzeShot } from '../utils/geminiDirect';
import { generateFallbackShotRating } from '../../lib/cinematicEngine';

// Helper to optimize and resize large images on client to prevent upload timeouts & Vercel 4.5MB payload limits
function optimizeImage(file: File, maxWidth = 1280, quality = 0.82): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw dataUrl if image decoding fails
        resolve({ dataUrl: e.target?.result as string, mimeType: file.type || 'image/jpeg' });
      };
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: e.target?.result as string, mimeType: file.type || 'image/jpeg' });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        let optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // If still large (> 2.5MB base64), compress a bit more
        if (optimizedDataUrl.length > 2500000) {
          optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.72);
        }

        resolve({ dataUrl: optimizedDataUrl, mimeType: 'image/jpeg' });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const ShotRater: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [tier, setTier] = useState<CritiqueTier>('constructive');
  const [filmmakerNote, setFilmmakerNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryDelaySeconds, setRetryDelaySeconds] = useState<number | null>(null);
  const [result, setResult] = useState<ShotRatingResult | null>(null);

  // Post-Critique Interactive Director Consultation Chat
  interface FollowupMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }
  const [followupMessages, setFollowupMessages] = useState<FollowupMessage[]>([]);
  const [followupInput, setFollowupInput] = useState('');
  const [followupLoading, setFollowupLoading] = useState(false);
  const followupChatEndRef = useRef<HTMLDivElement>(null);

  // Auto-seed welcoming consultation prompt when critique is generated
  React.useEffect(() => {
    if (result) {
      setFollowupMessages([
        {
          id: 'init-greeting',
          role: 'assistant',
          content: `**Cinematography Vision Audit Complete (${result.scores?.overall?.toFixed(1) || '8.0'}/10)**\n\nI have evaluated your ${result.shotClassification?.shotType || 'shot'} (apparent lens: ${result.shotClassification?.apparentFocalLength || 'Standard Prime'}). Ask me how to fix the key-to-fill lighting, improve contrast, or what **budget gear in ₹ INR or $ USD** (from ₹300 DIY diffusion to Godox/Amaran lights and fast prime lenses) can upgrade this exact frame on set!`,
          timestamp: 'Just now',
        },
      ]);
    }
  }, [result]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 4 Critique Tiers for Shot Evaluation
  const TIERS: {
    id: CritiqueTier;
    label: string;
    badge: string;
    desc: string;
    scoreRange: string;
    icon: any;
    color: string;
    badgeClass: string;
    activeBorderClass: string;
    activeBgClass: string;
  }[] = [
    {
      id: 'friendly',
      label: 'Friendly',
      badge: 'Supportive & Generous',
      desc: 'Affirmative critique highlighting creative instincts, framing bravery, and emotional mood with soft guidance.',
      scoreRange: '7.8 – 9.6',
      icon: Smile,
      color: 'emerald',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      activeBorderClass: 'border-emerald-500',
      activeBgClass: 'bg-emerald-950/30 text-emerald-300',
    },
    {
      id: 'constructive',
      label: 'Constructive',
      badge: 'Film School Mentor',
      desc: 'Balanced, craft-driven instruction analyzing lighting ratios, headroom balance, and actionable on-set fixes.',
      scoreRange: '6.5 – 8.6',
      icon: Scale,
      color: 'sky',
      badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      activeBorderClass: 'border-sky-500',
      activeBgClass: 'bg-sky-950/30 text-sky-300',
    },
    {
      id: 'moderate',
      label: 'Moderate',
      badge: 'Festival Screener',
      desc: 'Neutral, realistic benchmark evaluating the shot against standard commercial indie and festival standards.',
      scoreRange: '5.5 – 7.8',
      icon: Layers,
      color: 'amber',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      activeBorderClass: 'border-amber-500',
      activeBgClass: 'bg-amber-950/30 text-amber-300',
    },
    {
      id: 'brutal',
      label: 'Brutal',
      badge: 'Ruthless Hollywood DP',
      desc: 'Uncompromising, zero sugar-coating. Mercilessly tears into flat lighting, crushed shadows, digital artifacts, and clichés.',
      scoreRange: '3.0 – 6.5',
      icon: Flame,
      color: 'rose',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      activeBorderClass: 'border-rose-500',
      activeBgClass: 'bg-rose-950/30 text-rose-300',
    },
  ];

  // Sample cinematographic stills for immediate testing
  const sampleStills = [
    {
      name: 'High-Contrast Chiaroscuro',
      url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Neon Cyberpunk Alley',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Golden Hour Intimate Dialogue',
      url: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { dataUrl, mimeType: safeMime } = await optimizeImage(file);
      setImagePreview(dataUrl);
      setMimeType(safeMime);
      setResult(null);
      setError(null);
    } catch (err) {
      console.warn('Image optimization failed, falling back to raw reader', err);
      setMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], 'sample.jpg', { type: blob.type || 'image/jpeg' });
      const { dataUrl, mimeType: safeMime } = await optimizeImage(file);
      setImagePreview(dataUrl);
      setMimeType(safeMime);
      setResult(null);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Could not load sample still frame.');
    }
  };

  const handleSubmitAnalysis = async () => {
    if (!imagePreview) {
      setError('Please upload or snap a cinematography frame first.');
      return;
    }

    setLoading(true);
    setError(null);
    setRetryDelaySeconds(null);

    try {
      let ratingResult: ShotRatingResult | null = null;
      let serverError: any = null;

      try {
        const res = await fetchWithAuth('/api/shot-rater', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imagePreview,
            mimeType,
            userNotes: filmmakerNote,
            tier,
          }),
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data) ratingResult = data.rating;
        } else {
          try {
            const errData = await res.json().catch(() => null);
            if (errData) {
              const delay = errData.retryDelaySeconds || (res.status === 429 ? 15 : null);
              setRetryDelaySeconds(delay);
              serverError = new Error(errData.error || errData.message || `Request failed (${res.status})`);
            } else {
              serverError = new Error(`Request failed with HTTP status ${res.status}`);
            }
          } catch {
            const raw = await res.text().catch(() => '');
            serverError = new Error(raw ? `Server returned: ${raw.slice(0, 180)}` : `Request failed with HTTP status ${res.status}`);
          }
        }
      } catch (networkErr: any) {
        serverError = networkErr;
      }

      // If backend failed (e.g. network issue), seamlessly use client direct engine
      if (!ratingResult) {
        try {
          ratingResult = await directAnalyzeShot({
            imageBase64: imagePreview,
            mimeType,
            userNotes: filmmakerNote,
            tier,
          });
        } catch (directErr: any) {
          throw serverError || directErr || new Error('Could not analyze still frame. Please try again.');
        }
      }

      setResult(ratingResult);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error occurred while analyzing shot.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowup = async (customPrompt?: string) => {
    const textToSend = (customPrompt || followupInput).trim();
    if (!textToSend || followupLoading || !result) return;

    const userMsgId = 'user-' + Date.now();
    const assistantMsgId = 'assistant-' + Date.now();

    const newMessages = [
      ...followupMessages,
      {
        id: userMsgId,
        role: 'user' as const,
        content: textToSend,
        timestamp: 'Just now',
      },
      {
        id: assistantMsgId,
        role: 'assistant' as const,
        content: '',
        timestamp: 'Thinking...',
      },
    ];

    setFollowupMessages(newMessages);
    setFollowupInput('');
    setFollowupLoading(true);

    setTimeout(() => {
      followupChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);

    const prompt = `You are a professional cinematography mentor and camera/lighting expert reviewing a specific shot analysis.
Shot context:
- Shot type: ${result.shotClassification?.shotType || 'Medium Shot'}
- Focal length: ${result.shotClassification?.apparentFocalLength || 'Standard Prime'}
- Lighting score: ${result.scores?.lighting?.toFixed(1) || '7.5'}/10 (${result.lightingFeedback?.critique || result.lightingFeedback?.summary || ''})
- Composition score: ${result.scores?.composition?.toFixed(1) || '8.0'}/10 (${result.compositionFeedback?.critique || result.compositionFeedback?.summary || ''})
- Color score: ${result.scores?.color?.toFixed(1) || '7.5'}/10
- Overall rating: ${result.scores?.overall?.toFixed(1) || '8.0'}/10
- Actionable Fixes Identified: ${(result.actionableFixes || []).join('; ')}

Filmmaker's Follow-up Question: "${textToSend}"

Please provide concise, highly practical, battle-tested advice for on-set execution and post-production. Specifically detail:
1. Exact camera/lighting steps to fix or elevate the shot on set.
2. Practical budget gear suggestions with realistic pricing in ₹ INR and $ USD (e.g., ₹500 / $6 5-in-1 reflector, ₹4,500 / $55 Godox/Amaran pocket LED, DIY grid, ₹8,500 / $99 TTArtisan/Meike fast prime lens vs standard kit lenses).
Format with clean bullet points and bold section headers. Keep it punchy and actionable.`;

    try {
      const response = await fetchWithAuth('/api/assistant/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          history: followupMessages.slice(-4).map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('API request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulated += parsed.text;
                setFollowupMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId ? { ...msg, content: accumulated, timestamp: 'Just now' } : msg
                  )
                );
              }
            } catch {
              // Ignore partial chunk parse
            }
          }
        }
      }

      if (!accumulated) {
        throw new Error('Empty response');
      }
    } catch {
      // Resilient fallback with budget equipment advice in INR and USD
      const fallbackResponse = `### On-Set Camera & Lighting Strategy

**1. Practical Contrast & Lighting Fix:**
- Add negative fill on the shadow side using black foam core or dark fabric to deepen contrast ratio without digital crushing.
- Soften your key source using a 1/2 grid or 5-in-1 translucent diffuser held 2-3 feet from the subject's face.

**2. Recommended Budget Gear Fixes (₹ INR & $ USD):**
- **5-in-1 Collapsible Reflector (43")**: ~₹600 – ₹1,200 ($10 – $15 USD) — instant bounce & negative fill.
- **Amaran MC / Godox M1 Pocket RGB LED**: ~₹4,500 – ₹6,990 ($55 – $85 USD) — magnetic, portable eye-light and rim accent.
- **TTArtisan 35mm / 50mm f/1.4 Fast Prime**: ~₹8,500 – ₹11,500 ($99 – $139 USD) — creates organic shallow depth of field and beautiful bokeh separation compared to kit zooms.
- **DIY Diffusion & Grid (Shower curtain / black corrugated sheet)**: Under ₹300 ($4 USD) — cinema-grade soft light on any budget.

**3. Framing Adjustment:**
Align subject eye-line with the upper 1/3 grid coordinate and leave breathing room towards the direction of the eyeline.`;

      setFollowupMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, content: fallbackResponse, timestamp: 'Just now' } : msg
        )
      );
    } finally {
      setFollowupLoading(false);
      setTimeout(() => {
        followupChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const resetAll = () => {
    setImagePreview(null);
    setResult(null);
    setError(null);
    setFilmmakerNote('');
    setFollowupMessages([]);
    setFollowupInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Title Header */}
      <div className="mb-6 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest mb-2">
          <Camera className="w-4 h-4" />
          Multimodal Cinematography Vision Engine
        </div>
        <h2 className="font-courier text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          THE SHOT RATER
        </h2>
        <p className="text-zinc-400 text-sm mt-1 max-w-2xl font-mono">
          Upload any still frame from your camera, phone, or grade. Select your critique tier to dial in feedback from friendly encouragement to brutal Hollywood scrutiny.
        </p>
      </div>

      {/* Critique Tier Selector: Friendly, Constructive, Moderate, Brutal */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Evaluation Tier
          </label>
          <span className="text-[11px] font-mono text-zinc-500">
            Active Persona: <span className="text-white font-semibold capitalize">{tier}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {TIERS.map((t) => {
            const Icon = t.icon;
            const isSelected = tier === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTier(t.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? `${t.activeBorderClass} ${t.activeBgClass} shadow-md`
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-courier font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${t.badgeClass}`}>
                      {t.scoreRange}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                    {t.badge}
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400 font-sans line-clamp-2">
                  {t.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* PERSISTENT IMAGE & UPLOAD CONTAINER */}
      {!imagePreview ? (
        /* Empty Upload Dropzone */
        <div className="p-8 sm:p-12 rounded-2xl bg-zinc-950/80 border-2 border-dashed border-zinc-800 hover:border-amber-500/50 transition-all text-center backdrop-blur-sm mb-8">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 mx-auto flex items-center justify-center text-amber-400 shadow-inner mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="font-courier text-xl font-bold text-white mb-1">
            Drop a Cinema Still Frame Here
          </h3>
          <p className="text-zinc-500 text-xs font-mono mb-6">
            Supports JPG, PNG, WEBP &bull; Mobile camera capture or high-res graded export
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/10 transition-transform active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              Browse Image Files
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-mono uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              Snap with Camera
            </button>
          </div>

          {/* Preset Test Stills */}
          <div className="mt-8 pt-6 border-t border-zinc-900/90 max-w-lg mx-auto">
            <span className="text-[11px] font-mono text-zinc-500 block mb-2.5">
              Or critique a sample test frame:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {sampleStills.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(sample.url)}
                  className="px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-amber-300 border border-zinc-800 transition-colors cursor-pointer"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Image is LOADED: PERSISTS ON SCREEN THROUGHOUT THE ENTIRE FLOW */
        <div className="mb-8">
          <div className="p-4 sm:p-6 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
            {/* Top Toolbar for Loaded Frame */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                  Active Reference Frame
                </span>
                {result?.shotClassification?.aspectRatio && (
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-amber-400">
                    {result.shotClassification.aspectRatio}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  Change Frame
                </button>
                <button
                  onClick={resetAll}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-mono border border-red-800/40 transition-colors cursor-pointer"
                >
                  Clear Frame
                </button>
              </div>
            </div>

            {/* Static Image Preview Frame (always on screen) */}
            <div className="relative rounded-xl overflow-hidden bg-black border border-amber-500/30 shadow-2xl flex items-center justify-center max-h-[460px]">
              <img
                src={imagePreview}
                alt="Cinematography Frame Under Analysis"
                className="w-full max-h-[460px] object-contain mx-auto"
              />

              {/* Shutter scanning overlay when analyzing */}
              {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-center">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-lg shadow-amber-400/50"></div>
                  <span className="mt-4 px-3 py-1 rounded-full bg-black/80 border border-amber-400/40 text-amber-400 font-mono text-xs tracking-widest uppercase">
                    Scrutinizing Lighting & Optical Physics...
                  </span>
                </div>
              )}
            </div>

            {/* Filmmaker Context & Action Trigger (visible when not loading) */}
            {!loading && (
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={filmmakerNote}
                  onChange={(e) => setFilmmakerNote(e.target.value)}
                  placeholder="Optional context: e.g. Anamorphic 50mm, night exterior, natural practical lighting..."
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-sm sm:text-xs font-mono text-white outline-none touch-manipulation min-h-[44px]"
                />
                <button
                  onClick={handleSubmitAnalysis}
                  className="px-5 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold font-mono tracking-wider text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer transition-all touch-manipulation active:scale-[0.99] min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  {result ? 'Re-Analyze Frame' : 'Critique Shot Cinematography'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Loading state indicator (displayed directly beneath the active frame) */}
      {loading && (
        <ResearchingIndicator
          toolName="Shot Rater Vision Engine"
          customMessages={[
            'Decoding pixel data & analyzing optical focal length...',
            'Auditing key-to-fill contrast ratio & highlight roll-off...',
            'Checking skin tone vectorscope alignment & color temperature harmony...',
            'Inspecting edge aliasing, sensor noise, and CGI compositing consistency...',
          ]}
        />
      )}

      {/* Error state */}
      {error && !loading && (
        <ErrorState
          message={error}
          onRetry={handleSubmitAnalysis}
          toolName="Shot Rater"
          title="Shot Rater Analysis Notice"
          retryButtonText="Retry Shot Analysis"
          retryDelaySeconds={retryDelaySeconds}
        />
      )}

      {/* STRUCTURED CRITIQUE RESULTS (Rendered alongside/below the persistent image) */}
      {result && !loading && !error && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Top Header Card with Rating */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono uppercase tracking-widest">
                    <Sliders className="w-3.5 h-3.5" />
                    Cinematographic Assessment
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-mono uppercase tracking-wider font-bold ${
                      tier === 'brutal'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : tier === 'friendly'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : tier === 'moderate'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    }`}
                  >
                    Tier: {tier}
                  </span>
                </div>
                <h3 className="font-courier text-2xl sm:text-3xl font-bold text-white">
                  {result.shotClassification?.shotType || 'Cinematic Shot'}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                    Est. Lens: {result.shotClassification?.apparentFocalLength || 'Standard Prime'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                    Tone: {result.shotClassification?.visualTone || 'Cinematic'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
                    Aspect: {result.shotClassification?.aspectRatio || '16:9'}
                  </span>
                </div>
              </div>

              {/* Overall Score Dial */}
              <div className="flex items-center gap-6">
                <div className="text-center px-6 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="text-xs font-mono text-amber-400 uppercase tracking-wider mb-0.5">
                    Overall Score
                  </div>
                  <div className="font-courier text-3xl sm:text-4xl font-black text-white">
                    {result.scores?.overall?.toFixed(1) || '8.0'}
                    <span className="text-sm font-normal text-amber-400">/10</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-scores grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                  Composition
                </span>
                <span className="font-courier text-lg font-bold text-white">
                  {result.scores?.composition?.toFixed(1) || '8.0'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                  Lighting
                </span>
                <span className="font-courier text-lg font-bold text-white">
                  {result.scores?.lighting?.toFixed(1) || '8.0'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                  Color Grade
                </span>
                <span className="font-courier text-lg font-bold text-white">
                  {result.scores?.color?.toFixed(1) || '8.0'}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-center">
                <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">
                  Tech Cleanliness
                </span>
                <span className="font-courier text-lg font-bold text-white">
                  {result.scores?.technicalPurity?.toFixed(1) || '8.0'}
                </span>
              </div>
            </div>
          </div>

          {/* Conversational Dialogue Text Box: How the AI feels & Why the shot is the way it is */}
          {(result.emotionalImpression || result.compositionFeedback?.summary) && (
            <div
              className={`p-5 sm:p-6 rounded-2xl border relative overflow-hidden backdrop-blur-sm shadow-xl ${
                tier === 'brutal'
                  ? 'bg-gradient-to-br from-rose-950/25 via-zinc-950 to-zinc-950 border-rose-500/35'
                  : tier === 'friendly'
                  ? 'bg-gradient-to-br from-emerald-950/25 via-zinc-950 to-zinc-950 border-emerald-500/35'
                  : tier === 'moderate'
                  ? 'bg-gradient-to-br from-amber-950/25 via-zinc-950 to-zinc-950 border-amber-500/35'
                  : 'bg-gradient-to-br from-sky-950/25 via-zinc-950 to-zinc-950 border-sky-500/35'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-zinc-800/60 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      tier === 'brutal'
                        ? 'bg-rose-500/20 text-rose-400'
                        : tier === 'friendly'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : tier === 'moderate'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-sky-500/20 text-sky-400'
                    }`}
                  >
                    <MessageSquareQuote className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-courier text-xs sm:text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                      <span>How The AI Feels &bull; Honest Dialogue</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">
                        Human Take
                      </span>
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-400">
                      2-3 lines in plain, easy-to-grasp language on why the shot is the way it is (beyond technical specs)
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize font-semibold ${
                    tier === 'brutal'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : tier === 'friendly'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : tier === 'moderate'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                  }`}
                >
                  {tier} Persona
                </span>
              </div>

              <div className="relative pl-3 sm:pl-4 border-l-2 border-amber-500/50 py-1">
                <p className="font-sans text-sm sm:text-base leading-relaxed text-zinc-100 italic selection:bg-amber-500/30">
                  &ldquo;{result.emotionalImpression || result.compositionFeedback?.summary}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Feedback Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Composition & Framing */}
            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                Composition & Framing
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                {result.compositionFeedback?.critique || result.compositionFeedback?.summary}
              </p>
              {result.compositionFeedback?.strengths && (
                <div className="pt-2 space-y-1">
                  {result.compositionFeedback.strengths.map((str, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-mono text-emerald-400/90">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Lighting & Exposure */}
            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
                <Sun className="w-4 h-4" />
                Lighting & Dynamic Range
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                {result.lightingFeedback?.critique || result.lightingFeedback?.summary}
              </p>
              {result.lightingFeedback?.strengths && (
                <div className="pt-2 space-y-1">
                  {result.lightingFeedback.strengths.map((str, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-mono text-emerald-400/90">
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>{str}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Color Grade & Extracted Palette */}
            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
                <Palette className="w-4 h-4" />
                Color Grading & Skin Tones
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                {result.colorGradeFeedback?.critique || result.colorGradeFeedback?.summary}
              </p>
              {result.colorGradeFeedback?.palette && (
                <div className="pt-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-1.5">
                    Extracted Chromatic Palette:
                  </span>
                  <div className="flex gap-2">
                    {result.colorGradeFeedback.palette.map((color, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div
                          className="w-8 h-8 rounded border border-zinc-700 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                        <span className="text-[9px] font-mono text-zinc-400">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Visible Technical Artifacts */}
            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                Sensor & Digital Artifacts
              </div>
              <p className="text-xs text-zinc-300 font-mono">
                <span className="text-zinc-500">Texture Analysis:</span>{' '}
                {result.technicalArtifacts?.noiseOrGrain || 'Fine texture.'}
              </p>
              {result.technicalArtifacts?.detectedIssues &&
              result.technicalArtifacts.detectedIssues.length > 0 ? (
                <div className="space-y-1 pt-1">
                  {result.technicalArtifacts.detectedIssues.map((issue, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs font-mono text-amber-300/90">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>No severe posterization, pixel binning, or clipping detected.</span>
                </div>
              )}
            </div>
          </div>

          {/* 5. VFX & CGI Compositing Inspection */}
          <div className="p-6 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                VFX / CGI & Optical Physics Audit
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                  result.vfxInspection?.hasVfxElements
                    ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {result.vfxInspection?.hasVfxElements ? 'VFX Elements Detected' : 'Organic Optical Plate'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-200 font-sans leading-relaxed">
              {result.vfxInspection?.assessment}
            </p>
          </div>

          {/* 6. Concrete Actionable Fixes */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-950/30 via-zinc-950 to-zinc-950 border border-amber-500/50 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              Director / DP Action Plan: 2-3 Concrete Fixes
            </div>
            <h4 className="font-courier text-lg font-bold text-white">
              What To Adjust On Set or in the Color Suite:
            </h4>

            <div className="grid grid-cols-1 gap-3 pt-1">
              {result.actionableFixes && result.actionableFixes.length > 0 ? (
                result.actionableFixes.map((fix, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-zinc-900/90 border border-amber-500/30 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/40">
                      0{idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-zinc-200 font-mono leading-relaxed">
                      {fix}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-400 font-mono">Frame is technically sound.</p>
              )}
            </div>
          </div>

          {/* 7. Post-Critique Director Consultation & Budget Fixes Chat */}
          <div className="p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest">
                  <Bot className="w-4 h-4 text-amber-400" />
                  Post-Critique Director Consultation & Budget Gear
                </div>
                <h4 className="font-courier text-lg sm:text-xl font-bold text-white">
                  Discuss Fixes, Camera Setup & Budget Equipment
                </h4>
                <p className="text-xs text-zinc-400 font-mono">
                  Ask how to fix lighting, framing, contrast, or ask for gear recommendations in ₹ INR & $ USD.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Coins className="w-3.5 h-3.5" />
                  ₹ INR / $ USD Ready
                </span>
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Quick Questions for this Frame:
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'What budget lighting gear under ₹5,000 / $60 can fix this frame?',
                  'How can I improve contrast without crushing shadow detail?',
                  'What fast prime lens (35mm or 50mm) would elevate this composition?',
                  'How to fix the headroom and subject eyeline on set?',
                ].map((promptText, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={followupLoading}
                    onClick={() => handleSendFollowup(promptText)}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-amber-300 border border-zinc-800 hover:border-amber-500/40 transition-colors cursor-pointer text-left"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>

            {/* Follow-up Message Thread */}
            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 py-1 custom-scrollbar">
              {followupMessages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono ${
                        isAssistant
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {isAssistant ? <Bot className="w-4 h-4" /> : <Edit3 className="w-3.5 h-3.5" />}
                    </div>
                    <div
                      className={`max-w-[85%] rounded-xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                        isAssistant
                          ? 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                          : 'bg-amber-500/15 border border-amber-500/40 text-amber-200 font-mono'
                      }`}
                    >
                      <div className="whitespace-pre-line font-sans">{msg.content || 'Analyzing shot physics...'}</div>
                      <div className="mt-1 text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={followupChatEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendFollowup();
              }}
              className="flex gap-2 pt-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={followupInput}
                  onChange={(e) => setFollowupInput(e.target.value)}
                  placeholder="Ask for lighting fixes, lens options, or budget equipment (₹ INR / $ USD)..."
                  disabled={followupLoading}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all pr-10 font-mono"
                />
                <DollarSign className="w-4 h-4 text-zinc-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <button
                type="submit"
                disabled={!followupInput.trim() || followupLoading}
                className="px-4 sm:px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-mono font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
              >
                {followupLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Ask AI</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
