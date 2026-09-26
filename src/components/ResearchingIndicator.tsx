import React, { useEffect, useState } from 'react';
import { RefreshCw, Search, AlertCircle, Film, Sparkles, Key, ExternalLink, Check, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getStoredApiKey, setStoredApiKey } from '../utils/api';

interface ResearchingIndicatorProps {
  toolName: string;
  customMessages?: string[];
}

export const ResearchingIndicator: React.FC<ResearchingIndicatorProps> = ({
  toolName,
  customMessages,
}) => {
  const defaultMessages = [
    'Initializing live search grounding...',
    'Interrogating film archives & cinematography databases...',
    'Verifying real-world facts & verifiable credits...',
    'Synthesizing cinematic breakdown...',
  ];

  const messages = customMessages && customMessages.length > 0 ? customMessages : defaultMessages;
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % messages.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="w-full max-w-xl mx-auto my-12 p-8 rounded-xl bg-zinc-950/80 border border-amber-500/30 text-center shadow-2xl shadow-black relative overflow-hidden backdrop-blur-sm">
      {/* Decorative film gate lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Animated Camera Shutter / Film Reel Icon */}
      <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-900 border border-amber-500/40 mb-5 shadow-inner">
        <Film className="w-7 h-7 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="absolute w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono tracking-wider uppercase mb-3">
        <Search className="w-3.5 h-3.5 animate-pulse" />
        Live Grounded Researching &bull; {toolName}
      </div>

      <h3 className="font-courier text-lg sm:text-xl font-bold text-white mb-2">
        {messages[currentIdx]}
      </h3>

      <p className="text-xs font-mono text-zinc-500 tracking-wide">
        Querying Gemini 3.8 Flash with live Google Search &bull; No cached or synthetic data
      </p>

      {/* Progress bar simulation */}
      <div className="w-48 h-1 bg-zinc-800 rounded-full mx-auto mt-6 overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full animate-indeterminate"></div>
      </div>
    </div>
  );
};

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  toolName?: string;
  title?: string;
  retryButtonText?: string;
  retryDelaySeconds?: number | null;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to complete the live research query.',
  onRetry,
  toolName = 'Tool',
  title,
  retryButtonText,
  retryDelaySeconds = null,
}) => {
  const { openSettings } = useSettings();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(retryDelaySeconds);
  const onRetryRef = React.useRef(onRetry);
  onRetryRef.current = onRetry;
  const hasTriggeredRef = React.useRef(false);

  // Inline Key State
  const isAuthError =
    message.toLowerCase().includes('api key') ||
    message.toLowerCase().includes('session token') ||
    message.toLowerCase().includes('unauthenticated') ||
    message.toLowerCase().includes('401');

  const [inlineKey, setInlineKey] = useState<string>(() => getStoredApiKey());
  const [showInlineKey, setShowInlineKey] = useState<boolean>(false);
  const [isSavingKey, setIsSavingKey] = useState<boolean>(false);
  const [keySaveError, setKeySaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!retryDelaySeconds || retryDelaySeconds <= 0) {
      setSecondsLeft(null);
      hasTriggeredRef.current = false;
      return;
    }

    setSecondsLeft(retryDelaySeconds);
    hasTriggeredRef.current = false;
  }, [retryDelaySeconds]);

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        // Invoke retry safely outside render phase
        const timer = setTimeout(() => {
          onRetryRef.current();
        }, 50);
        return () => clearTimeout(timer);
      }
      return;
    }

    const timer = setTimeout(() => {
      setSecondsLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleManualRetry = () => {
    setSecondsLeft(null);
    hasTriggeredRef.current = true;
    onRetryRef.current();
  };

  const handleConnectAndRetry = async () => {
    if (!inlineKey.trim()) {
      setKeySaveError('Please enter a valid Gemini API key.');
      return;
    }

    setIsSavingKey(true);
    setKeySaveError(null);
    try {
      const res = await fetch('/api/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: inlineKey.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify key with Google.');
      }
      setStoredApiKey(inlineKey.trim());
      // Successfully saved, trigger retry immediately!
      handleManualRetry();
    } catch (err: any) {
      setKeySaveError(err.message || 'Key verification failed.');
    } finally {
      setIsSavingKey(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto my-12 p-6 sm:p-8 rounded-2xl bg-zinc-950 border border-amber-500/40 text-center shadow-2xl relative overflow-hidden backdrop-blur-sm">
      {/* Decorative top alert border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500"></div>

      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-400 mb-4">
        {isAuthError ? <Key className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
      </div>

      <h3 className="font-courier text-lg sm:text-xl font-bold text-white mb-2">
        {title || (secondsLeft !== null && secondsLeft > 0 ? `${toolName} Query Delayed` : `${toolName} Notice`)}
      </h3>

      <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">{message}</p>

      {/* Special Inline API Key Card for Auth Errors */}
      {isAuthError && (
        <div className="mb-6 p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              Quick Connect Gemini API Key
            </span>
            <button
              type="button"
              onClick={() => openSettings('key')}
              className="text-[11px] font-mono text-zinc-400 hover:text-amber-400 underline cursor-pointer"
            >
              Open Settings
            </button>
          </div>

          <div className="relative flex items-center">
            <input
              type={showInlineKey ? 'text' : 'password'}
              value={inlineKey}
              onChange={(e) => setInlineKey(e.target.value)}
              placeholder="Paste AIzaSy... key here"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowInlineKey(!showInlineKey)}
              className="absolute right-2.5 text-zinc-400 hover:text-zinc-200 cursor-pointer p-1"
            >
              {showInlineKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {keySaveError && (
            <p className="text-xs font-mono text-red-400 bg-red-950/40 p-2 rounded border border-red-500/20">
              {keySaveError}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-amber-400 hover:text-amber-300 inline-flex items-center gap-1"
            >
              <span>Get Free Key from Google</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={handleConnectAndRetry}
              disabled={isSavingKey || !inlineKey.trim()}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              {isSavingKey ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save &amp; Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Automatic countdown indicator if 429 rate limit delay is active */}
      {secondsLeft !== null && secondsLeft > 0 ? (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 max-w-sm mx-auto">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-mono text-xs uppercase tracking-wider mb-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Automatic Rate-Limit Cooldown
          </div>
          <div className="font-courier text-2xl font-bold text-white">
            Retrying in <span className="text-amber-400">{secondsLeft}s</span>
          </div>
          <p className="text-[10px] font-mono text-zinc-400 mt-1">
            Reading retryDelay from API quota response
          </p>
        </div>
      ) : null}

      {!isAuthError && (
        <button
          onClick={handleManualRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase font-mono transition-all shadow-lg shadow-amber-500/10 cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          {secondsLeft !== null && secondsLeft > 0
            ? 'Retry Immediately'
            : retryButtonText ||
              (toolName.toLowerCase().includes('search') ||
              toolName.toLowerCase().includes('movie') ||
              toolName.toLowerCase().includes('gear')
                ? 'Retry Live Search'
                : 'Retry Analysis')}
        </button>
      )}
    </div>
  );
};
