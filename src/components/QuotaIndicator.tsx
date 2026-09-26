import React, { useState, useEffect } from 'react';
import { Zap, Clock, RefreshCw } from 'lucide-react';
import { QuotaStatus } from '../types';

export const QuotaIndicator: React.FC = () => {
  const [quota, setQuota] = useState<QuotaStatus>({
    requestsRemaining: 15,
    maxPerMinute: 15,
    refreshSeconds: 60,
    activeModel: 'gemini-3.1-flash-lite',
    isCooldown: false,
  });
  const [countdown, setCountdown] = useState<number>(60);

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/quota');
      if (res.ok) {
        const data = await res.json();
        setQuota(data);
        setCountdown(data.refreshSeconds || 60);
      }
    } catch {
      // Ignore network hiccup
    }
  };

  useEffect(() => {
    fetchQuota();
    // Poll every 8 seconds to synchronize with API requests
    const interval = setInterval(fetchQuota, 8000);
    return () => clearInterval(interval);
  }, []);

  // Local second-by-second ticker for smooth visual countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchQuota();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isLow = quota.requestsRemaining <= 3;
  const isCooldown = quota.isCooldown || quota.requestsRemaining === 0;

  return (
    <div
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono transition-all ${
        isCooldown
          ? 'bg-red-950/40 border-red-500/50 text-red-300'
          : isLow
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
          : 'bg-zinc-900 border-zinc-700/80 text-zinc-300'
      }`}
      title={`Google Gemini Free Tier Quota: ${quota.requestsRemaining}/${quota.maxPerMinute} prompts left this minute window. Refreshes in ${countdown}s.`}
    >
      <Zap
        className={`w-3 h-3 ${
          isCooldown
            ? 'text-red-400 animate-pulse'
            : isLow
            ? 'text-amber-400 animate-bounce'
            : 'text-amber-400'
        }`}
      />

      <span className="font-bold">
        {quota.requestsRemaining}
        <span className="text-zinc-500 font-normal">/{quota.maxPerMinute}</span>
      </span>

      <span className="text-zinc-600 hidden sm:inline">&bull;</span>

      <span className="items-center gap-1 text-[10px] text-zinc-400 hidden sm:inline-flex">
        <Clock className="w-2.5 h-2.5 text-zinc-500" />
        <span>{countdown}s</span>
      </span>
    </div>
  );
};
