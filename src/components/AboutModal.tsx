import React from 'react';
import {
  Clapperboard,
  Instagram,
  Youtube,
  Linkedin,
  X,
  ExternalLink,
  Sparkles,
  Cpu,
  Clock,
  CheckCircle2,
  Film,
  Award,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 flex-shrink-0" />

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-800/90 flex items-center justify-between bg-[#0e0e12] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-courier text-base sm:text-lg font-bold text-white leading-none">
                ABOUT &amp; CREDITS
              </h3>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                StutterFrame Productions
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-zinc-300 text-sm font-sans flex-1">
          {/* Creator Profile Section */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/30 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-300 font-courier text-2xl font-bold flex-shrink-0 shadow-lg">
              AD
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h4 className="font-courier text-xl font-bold text-white">Abir D.W</h4>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-[10px] uppercase font-semibold">
                  Creator & Director
                </span>
              </div>
              <p className="text-zinc-400 text-xs font-mono leading-relaxed mb-4">
                Filmmaker, screenwriter, and director exploring the frontier between celluloid storytelling traditions and next-generation computational cinema tools.
              </p>

              {/* Verified Director Socials */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <a
                  href="https://www.instagram.com/not_abir_at_all"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-pink-950/40 text-zinc-300 hover:text-pink-400 border border-zinc-700 hover:border-pink-500/50 text-xs font-mono transition-all cursor-pointer"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                  <span>@not_abir_at_all</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>

                <a
                  href="https://www.youtube.com/@StutterFrameProductions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/40 text-zinc-300 hover:text-red-400 border border-zinc-700 hover:border-red-500/50 text-xs font-mono transition-all cursor-pointer"
                >
                  <Youtube className="w-3.5 h-3.5 text-red-400" />
                  <span>@StutterFrameProductions</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>

                <a
                  href="https://www.linkedin.com/in/abir-wahab-781326422/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-blue-950/40 text-zinc-300 hover:text-blue-400 border border-zinc-700 hover:border-blue-500/50 text-xs font-mono transition-all cursor-pointer"
                >
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Abir Wahab</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </div>
            </div>
          </div>

          {/* AI Usage Limits & Free Tier Architecture (Answers User Question) */}
          <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
              <Cpu className="w-4 h-4" />
              AI Use Limits & Free Tier Architecture
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-mono">
              StutterFrame is architected to be <strong>100% free with zero operational API bills</strong> for filmmakers, running exclusively on Google Gemini's Free Tier models:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-amber-400 font-bold block mb-1">
                  15 Requests Per Minute (RPM)
                </span>
                <span className="text-zinc-400 text-[11px] leading-relaxed block">
                  Rolling burst quota window provided by Google per model.
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-amber-400 font-bold block mb-1">
                  Multi-Model Cascade
                </span>
                <span className="text-zinc-400 text-[11px] leading-relaxed block">
                  Automatically cascades across Flash-Lite, Flash 3.8, and 3.5 to maximize availability.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300/90 flex items-start gap-2.5">
              <Clock className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
              <div>
                <strong>Built-In Automatic Cooldown:</strong> When Google's free-tier rate limit (429) is temporarily hit, StutterFrame parses the exact <code className="text-amber-200">retryDelay</code> returned by the API and counts down automatically on screen, then seamlessly retries your request.
              </div>
            </div>
          </div>

          {/* StutterFrame Toolkit Pillars */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              The 6 Cinematic Pillars:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Movie Picker: Live Search & Streaming</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Shot Rater: Multimodal Optical Vision</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Script Lab: Screenplay Doctoring</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Gear Suggestor: Real Indian INR Logistics</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-zinc-900 border border-zinc-800 sm:col-span-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Editing Help Lab: Hardware Benchmark & Suite Matcher</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800/90 bg-[#0e0e12] flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>StutterFrame v2.0 &bull; 35mm Celluloid Aesthetic</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
