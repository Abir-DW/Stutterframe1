import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Search,
  ExternalLink,
  RotateCcw,
  Clapperboard,
  Film,
} from 'lucide-react';
import { ChatMessage, GroundingSource } from '../types';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content:
        'I am the StutterFrame Assistant — your on-set mentor for cinematography, directing, screenplay mechanics, and camera gear. How can I assist your production today?',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [forceSearch, setForceSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'When should a director break the 180-degree rule?',
    'Explain lighting ratios: 2:1 vs 4:1 vs 8:1 with film examples',
    'What is the optical difference between spherical and anamorphic bokeh?',
    'How do I shoot a natural night exterior on a micro-budget?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (overrideText?: string) => {
    const text = overrideText || inputText;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: 'Just now',
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);

    try {
      // Connect to fast Flash-Lite streaming endpoint
      const res = await fetch('/api/assistant/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          forceSearch,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Streaming failed from StutterFrame Assistant.');
      }

      // Add empty assistant response to stream into
      const assistantId = (Date.now() + 1).toString();
      const initialAssistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: 'Just now',
      };

      setMessages((prev) => [...prev, initialAssistantMsg]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const payload = JSON.parse(trimmed.slice(6));
              if (payload.text) {
                accumulated += payload.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: accumulated } : m
                  )
                );
              }
              if (payload.done) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          content: accumulated,
                          grounded: payload.grounded,
                          sources: payload.sources || [],
                        }
                      : m
                  )
                );
              }
              if (payload.error) {
                throw new Error(payload.error);
              }
            } catch (jsonErr) {
              // Ignore partial chunk parsing
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Cut! The audio feed dropped out (error connecting to AI Studio). Please try your question again.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          'Slate cleared. Ready for a new take on cinematography, directing, or gear.',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Slide-over Drawer / Modal (triggered from header button) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-lg bg-[#0b0b0e] border-l border-zinc-800 shadow-2xl flex flex-col h-full z-10 animate-slideLeft">
            {/* Drawer Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Clapperboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-courier text-sm font-bold text-white leading-none">
                    STUTTERFRAME ASSISTANT
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Flash-Lite &bull; Live Stream &bull; Minimal Thinking
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearHistory}
                  title="Clear Chat History"
                  className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close Assistant"
                  className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Google Search Grounding Toggle Bar */}
            <div className="px-4 py-2 bg-[#0e0e12] border-b border-zinc-800/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Search Grounding:</span>
              </div>
              <button
                type="button"
                onClick={() => setForceSearch(!forceSearch)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors uppercase ${
                  forceSearch
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {forceSearch ? 'Forced ON (Live Facts)' : 'Smart Auto (Fastest)'}
              </button>
            </div>

            {/* Chat Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-black font-medium rounded-br-none shadow-md'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none shadow-sm font-sans'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {/* Grounding Source Badges if present */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-800 text-[10px] font-mono">
                        <span className="text-amber-400 block mb-1">
                          Verified Search Grounding Citations:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {msg.sources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-zinc-300 hover:text-amber-300 border border-zinc-700"
                            >
                              <ExternalLink className="w-2.5 h-2.5 text-amber-400" />
                              <span className="max-w-[150px] truncate">{s.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-zinc-600 mt-1 px-1">
                    {msg.role === 'user' ? 'Filmmaker' : 'Director AI'}
                  </span>
                </div>
              ))}

              {/* Live Researching / Typing state */}
              {loading && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 w-fit text-xs font-mono text-amber-400 animate-pulse">
                  <Film className="w-3.5 h-3.5 animate-spin" />
                  <span>Consulting cinematography archives...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Starter Prompts */}
            {messages.length <= 2 && (
              <div className="p-3 border-t border-zinc-900 bg-[#0d0d10] space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                  Quick Topics:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(p)}
                      className="text-[10px] font-mono px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-800 text-left transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar with safe-area padding for mobile home indicators */}
            <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] border-t border-zinc-800 bg-zinc-950">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about lighting, camera gear, scene beats..."
                  disabled={loading}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-sm sm:text-xs font-mono text-white outline-none"
                />
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-amber-500/10 min-w-[42px] min-h-[42px] flex items-center justify-center active:scale-95 touch-manipulation"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
