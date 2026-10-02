import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Camera,
  FileText,
  ShoppingBag,
  Scissors,
  HelpCircle,
  Home,
  Palette,
  Layers,
  Settings,
  X,
  Search,
  ArrowRight,
  Sparkles,
  Command,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface CommandCenterModalProps {
  currentRoute: string;
  navigate: (route: string) => void;
  openAssistant: () => void;
}

export const CommandCenterModal: React.FC<CommandCenterModalProps> = ({
  currentRoute,
  navigate,
  openAssistant,
}) => {
  const {
    isCommandPopupOpen,
    setIsCommandPopupOpen,
    uiLayout,
    setUILayout,
    uiStyle,
    theme,
    openSettings,
    triggerPageChangeEffect,
  } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isCommandPopupOpen) {
      setSearchQuery('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isCommandPopupOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPopupOpen(!isCommandPopupOpen);
      } else if (e.key === 'Escape' && isCommandPopupOpen) {
        setIsCommandPopupOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPopupOpen, setIsCommandPopupOpen]);

  if (!isCommandPopupOpen) return null;

  const tools = [
    {
      id: 'home',
      label: 'Home & Director Studio',
      desc: 'Cinematic typewriter overview, quick stats, and film hub',
      icon: Home,
      category: 'Overview',
      badge: 'Main Hub',
    },
    {
      id: 'movie-picker',
      label: 'Movie Picker',
      desc: 'AI film historian research with Wikipedia posters & streaming links',
      icon: Film,
      category: 'Creation & Discovery',
      badge: 'Search Grounded',
    },
    {
      id: 'shot-rater',
      label: 'Shot Rater',
      desc: 'Director of Photography frame critique & lighting analysis',
      icon: Camera,
      category: 'Analysis & Craft',
      badge: 'Vision AI',
    },
    {
      id: 'script-lab',
      label: 'Script Lab',
      desc: 'Screenplay co-writing, dialogue polishing & beat breakdown',
      icon: FileText,
      category: 'Creation & Discovery',
      badge: 'Screenplay',
    },
    {
      id: 'gear-suggestor',
      label: 'Gear Suggestor',
      desc: 'Amazon & Flipkart India verified filmmaker equipment recommendations',
      icon: ShoppingBag,
      category: 'Logistics & Gear',
      badge: 'INR Pricing',
    },
    {
      id: 'editor-advisor',
      label: 'Editing Help & NLE Advisor',
      desc: 'Resolve, Premiere, Final Cut & lightweight cutting recommendations',
      icon: Scissors,
      category: 'Logistics & Gear',
      badge: 'Post-Production',
    },
    {
      id: 'faq',
      label: 'FAQ & Celluloid Vault',
      desc: 'Director knowledge base, prompt glossary & technical guides',
      icon: HelpCircle,
      category: 'Reference',
      badge: 'Knowledge',
    },
  ];

  const filteredTools = tools.filter(
    (t) =>
      t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectRoute = (route: string, e: React.MouseEvent) => {
    setIsCommandPopupOpen(false);
    if (currentRoute !== route) {
      triggerPageChangeEffect({ x: e.clientX, y: e.clientY });
    }
    navigate(route);
  };

  return (
    <div
      className="fixed inset-0 z-[99995] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={() => setIsCommandPopupOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-zinc-950 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Film Strip Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 flex-shrink-0" />

        {/* Search & Header Row */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-800 bg-[#0e0e12] flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <Command className="w-4 h-4" />
          </div>

          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools, cinema features, shot rater..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-amber-400 text-sm font-mono text-white placeholder-zinc-500 outline-none transition-colors"
            />
          </div>

          <button
            onClick={() => setIsCommandPopupOpen(false)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close command deck"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Jump Bar */}
        <div className="px-3 sm:px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-400 gap-2 flex-shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Jump:</span>
            <button
              onClick={() => {
                setIsCommandPopupOpen(false);
                openSettings('ui-style');
              }}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap text-[11px]"
            >
              <Layers className="w-3 h-3 text-amber-400" />
              <span>Themes</span>
            </button>
            <button
              onClick={() => {
                setIsCommandPopupOpen(false);
                openSettings('layout');
              }}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap text-[11px]"
            >
              <Settings className="w-3 h-3 text-amber-400" />
              <span>Layouts</span>
            </button>
            <button
              onClick={() => {
                setIsCommandPopupOpen(false);
                openSettings('theme');
              }}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap text-[11px]"
            >
              <Palette className="w-3 h-3 text-amber-400" />
              <span>Palette</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-500 flex-shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono">
              ESC
            </kbd>
            <span>to close</span>
          </div>
        </div>

        {/* Main List of Tools */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-2 flex-1">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs">
              No cinema tools found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = currentRoute === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={(e) => handleSelectRoute(tool.id, e)}
                  className={`w-full p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 group active:scale-[0.99] touch-manipulation ${
                    isActive
                      ? 'bg-amber-500/15 border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
                        isActive
                          ? 'bg-amber-500 text-black shadow-xs font-bold'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-courier font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                          {tool.label}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase border flex-shrink-0 ${
                            isActive
                              ? 'bg-amber-500 text-black border-amber-400 font-bold'
                              : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                          }`}
                        >
                          {tool.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-sans mt-0.5 line-clamp-1">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 text-zinc-500 group-hover:text-amber-400 transition-colors">
                    {isActive ? (
                      <span className="text-xs font-mono font-bold text-amber-400">Active</span>
                    ) : (
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer with Assistant & Status */}
        <div className="px-4 py-3 bg-[#0a0a0d] border-t border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Active Architecture:</span>
            <span className="text-amber-400 font-bold capitalize">{uiStyle}</span>
          </div>

          <button
            onClick={() => {
              setIsCommandPopupOpen(false);
              openAssistant();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase transition-all cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5 text-black" />
            <span>Ask StutterFrame AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
