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
  Clock,
  Crosshair,
  Flame,
  Eye,
  Mountain,
  Zap,
  Grid,
  Info,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ChatMessage, DirectorPersonaId } from '../types';
import { fetchWithAuth } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import { DIRECTOR_PERSONAS, getDirectorPersona } from '../data/directorPersonas';

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
  const { assistantPosition, uiLayout } = useSettings();

  const [selectedPersonaId, setSelectedPersonaId] = useState<DirectorPersonaId>(() => {
    try {
      const saved = localStorage.getItem('stutterframe-director-persona') as DirectorPersonaId;
      const valid = DIRECTOR_PERSONAS.some((p) => p.id === saved);
      return valid ? saved : 'default';
    } catch {
      return 'default';
    }
  });

  const activePersona = getDirectorPersona(selectedPersonaId);
  const [showPersonaDetails, setShowPersonaDetails] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init',
      role: 'assistant',
      content: getDirectorPersona('default').initialGreeting,
      persona: 'default',
      timestamp: 'Just now',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [forceSearch, setForceSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const personasRailRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle switching persona
  const handleSelectPersona = (personaId: DirectorPersonaId) => {
    if (personaId === selectedPersonaId) return;

    const newPersona = getDirectorPersona(personaId);
    setSelectedPersonaId(personaId);
    try {
      localStorage.setItem('stutterframe-director-persona', personaId);
    } catch {}

    // If chat is at initial state (1 message), replace greeting with selected director's greeting
    if (messages.length <= 1) {
      setMessages([
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: newPersona.initialGreeting,
          persona: personaId,
          timestamp: 'Just now',
        },
      ]);
    } else {
      // Append a transition note indicating the new director has taken the chair
      const transitionMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `*${newPersona.name} has taken the director's chair.*\n\n${newPersona.initialGreeting}`,
        persona: personaId,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, transitionMsg]);
    }
  };

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
      // Connect to Flash-Lite streaming endpoint with directorPersona parameter
      const res = await fetchWithAuth('/api/assistant/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          forceSearch,
          directorPersona: activePersona.id,
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
        persona: activePersona.id,
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
            } catch {
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
        content: `Cut! The transmission dropped out. (${err?.message || 'Error communicating with assistant'}). Please try again.`,
        persona: activePersona.id,
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
        content: activePersona.initialGreeting,
        persona: activePersona.id,
        timestamp: 'Just now',
      },
    ]);
  };

  const renderPersonaIcon = (type: string, className = 'w-4 h-4') => {
    switch (type) {
      case 'hourglass':
        return <Clock className={className} />;
      case 'crosshair':
        return <Crosshair className={className} />;
      case 'trunk':
        return <Flame className={className} />;
      case 'aperture':
        return <Eye className={className} />;
      case 'monolith':
        return <Mountain className={className} />;
      case 'whip':
        return <Zap className={className} />;
      case 'symmetry':
        return <Grid className={className} />;
      default:
        return <Clapperboard className={className} />;
    }
  };

  return (
    <>
      {/* Slide-over Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-lg bg-[#0b0b0e] border-l border-zinc-800 shadow-2xl flex flex-col h-full z-10 animate-slideLeft">
            {/* 1. Drawer Header with Director Branding */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-md"
                  style={{
                    backgroundColor: `${activePersona.accentColor}25`,
                    borderColor: `${activePersona.accentColor}50`,
                    borderWidth: 1,
                    color: activePersona.accentColor,
                  }}
                >
                  {renderPersonaIcon(activePersona.iconType, 'w-4.5 h-4.5')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-courier text-sm font-bold text-white leading-none">
                      {activePersona.id === 'default'
                        ? 'STUTTERFRAME ASSISTANT'
                        : `${activePersona.name.toUpperCase()} AI`}
                    </h3>
                    {activePersona.id !== 'default' && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border"
                        style={{
                          borderColor: `${activePersona.accentColor}60`,
                          backgroundColor: `${activePersona.accentColor}20`,
                          color: activePersona.accentColor,
                        }}
                      >
                        Director Mode
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                    {activePersona.id === 'default'
                      ? 'Objective Technical & Cinematic Mentor'
                      : activePersona.tagline}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearHistory}
                  title="Clear Chat History (New Slate)"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close Assistant"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. DIRECTOR PERSONA SELECTOR RAIL (1-Click Switcher) */}
            <div className="bg-[#0e0e13] border-b border-zinc-800/90 px-3 py-2 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Film className="w-3 h-3 text-amber-400" />
                  <span>Director Persona:</span>
                </span>

                <div className="flex items-center gap-2">
                  {selectedPersonaId !== 'default' && (
                    <button
                      onClick={() => handleSelectPersona('default')}
                      className="text-[10px] text-zinc-400 hover:text-amber-400 font-mono transition-colors flex items-center gap-1 cursor-pointer"
                      title="Switch back to Default StutterFrame Assistant"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset to Default Bot</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowPersonaDetails(!showPersonaDetails)}
                    className="text-[10px] text-zinc-400 hover:text-white font-mono flex items-center gap-0.5 cursor-pointer"
                    title="View Director Hallmarks & Style"
                  >
                    <span>{showPersonaDetails ? 'Hide Bio' : 'Bio & Style'}</span>
                    {showPersonaDetails ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable Persona Chips */}
              <div
                ref={personasRailRef}
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1"
              >
                {DIRECTOR_PERSONAS.map((persona) => {
                  const isSelected = selectedPersonaId === persona.id;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => handleSelectPersona(persona.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer whitespace-nowrap flex-shrink-0 border ${
                        isSelected
                          ? 'shadow-sm font-bold scale-[1.02]'
                          : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                      }`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: `${persona.accentColor}20`,
                              borderColor: persona.accentColor,
                              color: '#ffffff',
                              boxShadow: `0 0 12px ${persona.accentColor}30`,
                            }
                          : undefined
                      }
                      title={`${persona.name}: ${persona.tagline}`}
                    >
                      <span
                        style={{
                          color: isSelected ? persona.accentColor : '#a1a1aa',
                        }}
                      >
                        {renderPersonaIcon(persona.iconType, 'w-3 h-3')}
                      </span>
                      <span>{persona.shortName}</span>
                      {isSelected && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: persona.accentColor }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Expandable Persona Philosophy & Hallmarks Card */}
              {showPersonaDetails && (
                <div
                  className="mt-2 p-3 rounded-xl border text-xs font-mono space-y-2 animate-fadeIn"
                  style={{
                    backgroundColor: `${activePersona.accentColor}0a`,
                    borderColor: `${activePersona.accentColor}30`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span style={{ color: activePersona.accentColor }}>
                          {renderPersonaIcon(activePersona.iconType, 'w-3.5 h-3.5')}
                        </span>
                        <span>{activePersona.name} Directorial Philosophy</span>
                      </div>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                        {activePersona.philosophy}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold mb-1">
                      Directorial Hallmarks &amp; Techniques:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {activePersona.filmHallmarks.map((h, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-[10px] text-zinc-300 bg-zinc-900/60 px-2 py-1 rounded border border-zinc-800/80"
                        >
                          <Check
                            className="w-3 h-3 flex-shrink-0"
                            style={{ color: activePersona.accentColor }}
                          />
                          <span className="truncate">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Google Search Grounding Bar */}
            <div className="px-4 py-1.5 bg-[#0b0b0e] border-b border-zinc-800/70 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Search className="w-3 h-3 text-amber-400" />
                <span className="text-[11px]">Real-World Web Facts:</span>
              </div>
              <button
                type="button"
                onClick={() => setForceSearch(!forceSearch)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono transition-colors uppercase cursor-pointer ${
                  forceSearch
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {forceSearch ? 'Search Forced ON' : 'Smart Auto'}
              </button>
            </div>

            {/* 4. Chat Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const msgPersona = msg.persona ? getDirectorPersona(msg.persona) : activePersona;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all shadow-sm ${
                        isUser
                          ? 'bg-amber-500 text-black font-medium rounded-br-none shadow-md'
                          : 'bg-zinc-900/90 border text-zinc-200 rounded-bl-none font-sans'
                      }`}
                      style={
                        !isUser
                          ? {
                              borderColor: `${msgPersona.accentColor}30`,
                              boxShadow: `0 2px 10px ${msgPersona.accentColor}0a`,
                            }
                          : undefined
                      }
                    >
                      {/* Persona Sub-header on assistant messages */}
                      {!isUser && msgPersona.id !== 'default' && (
                        <div
                          className="flex items-center gap-1.5 pb-2 mb-2 border-b text-[10px] font-mono font-bold"
                          style={{
                            borderColor: `${msgPersona.accentColor}25`,
                            color: msgPersona.accentColor,
                          }}
                        >
                          {renderPersonaIcon(msgPersona.iconType, 'w-3 h-3')}
                          <span>{msgPersona.name} Directorial Voice</span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

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

                    <span className="text-[9px] font-mono text-zinc-500 mt-1 px-1 flex items-center gap-1">
                      {isUser ? (
                        'Filmmaker'
                      ) : (
                        <>
                          <span style={{ color: msgPersona.accentColor }}>
                            {msgPersona.shortName}
                          </span>
                          <span>&bull; AI Persona</span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}

              {/* Live Researching / Typing state */}
              {loading && (
                <div
                  className="flex items-center gap-2 p-3 rounded-xl bg-zinc-900/80 border w-fit text-xs font-mono animate-pulse"
                  style={{
                    borderColor: `${activePersona.accentColor}40`,
                    color: activePersona.accentColor,
                  }}
                >
                  {renderPersonaIcon(activePersona.iconType, 'w-4 h-4 animate-spin')}
                  <span>
                    {activePersona.id === 'default'
                      ? 'Consulting cinematography archives...'
                      : `${activePersona.name} is conceiving the scene...`}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 5. Director-Specific Quick Starter Prompts */}
            {messages.length <= 3 && (
              <div className="p-3 border-t border-zinc-900 bg-[#0d0d10] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block font-semibold">
                    Ideate with {activePersona.shortName}:
                  </span>
                  <span
                    className="text-[9px] font-mono"
                    style={{ color: activePersona.accentColor }}
                  >
                    Click to ask
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activePersona.sampleStarters.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(p)}
                      className="text-[10px] font-mono px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-left transition-all cursor-pointer hover:border-zinc-700"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Input Bar with safe-area padding for mobile home indicators */}
            <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] border-t border-zinc-800 bg-zinc-950">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      activePersona.id === 'default'
                        ? 'Ask about lighting, camera gear, scene beats...'
                        : `Ask ${activePersona.name} to direct, ideate, or critique...`
                    }
                    disabled={loading}
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-sm sm:text-xs font-mono text-white outline-none"
                    style={{
                      borderColor: inputText ? `${activePersona.accentColor}70` : undefined,
                    }}
                  />
                  {inputText && (
                    <button
                      type="button"
                      onClick={() => setInputText('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !inputText.trim()}
                  className="p-2.5 rounded-xl text-black disabled:opacity-40 transition-all cursor-pointer shadow-md min-w-[42px] min-h-[42px] flex items-center justify-center active:scale-95 touch-manipulation"
                  style={{
                    backgroundColor: activePersona.accentColor,
                  }}
                  title={`Send to ${activePersona.name}`}
                >
                  <Send className="w-4 h-4 text-black" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Launcher Trigger Button based on assistantPosition setting (Omitted in floating-island layout because the island dock features its own integrated assistant launcher) */}
      {assistantPosition !== 'header-only' && uiLayout !== 'floating-island' && !isOpen && (
        <button
          onClick={onOpen}
          className={`fixed z-30 flex items-center gap-2 p-3 sm:px-4 sm:py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs shadow-xl shadow-amber-500/20 border border-amber-300/40 transition-all cursor-pointer active:scale-95 touch-manipulation group ${
            assistantPosition === 'bottom-left'
              ? uiLayout === 'bottom-nav'
                ? 'bottom-20 left-4 sm:left-6'
                : 'bottom-4 sm:bottom-6 left-4 sm:left-6'
              : uiLayout === 'bottom-nav'
              ? 'bottom-20 right-4 sm:right-6'
              : 'bottom-4 sm:bottom-6 right-4 sm:right-6'
          }`}
          title={`Open StutterFrame Assistant (${activePersona.shortName})`}
          aria-label="Ask StutterFrame AI"
        >
          <MessageSquare className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">
            Ask AI {activePersona.id !== 'default' ? `(${activePersona.shortName})` : 'Assistant'}
          </span>
        </button>
      )}
    </>
  );
};
