import React from 'react';
import {
  Clapperboard,
  Film,
  Camera,
  FileText,
  ShoppingBag,
  Scissors,
  HelpCircle,
  Home,
  Layers,
  Palette,
  Settings,
  Info,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Sliders,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface SidebarNavProps {
  currentRoute: string;
  navigate: (route: string) => void;
  openAssistant: () => void;
  openAbout: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentRoute,
  navigate,
  openAssistant,
  openAbout,
}) => {
  const {
    isSidebarExpanded,
    setIsSidebarExpanded,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    uiStyle,
    openSettings,
    triggerPageChangeEffect,
  } = useSettings();

  const navItems = [
    { id: 'home', label: 'Home Studio', icon: Home, badge: 'Hub' },
    { id: 'movie-picker', label: 'Movie Picker', icon: Film, badge: 'Discovery' },
    { id: 'shot-rater', label: 'Shot Rater', icon: Camera, badge: 'Vision' },
    { id: 'script-lab', label: 'Script Lab', icon: FileText, badge: 'Screenplay' },
    { id: 'gear-suggestor', label: 'Gear Suggestor', icon: ShoppingBag, badge: 'Hardware' },
    { id: 'editor-advisor', label: 'Editing Help', icon: Scissors, badge: 'NLE' },
    { id: 'faq', label: 'FAQ & Vault', icon: HelpCircle, badge: 'Docs' },
  ];

  const handleNavClick = (route: string, e: React.MouseEvent) => {
    if (currentRoute !== route) {
      triggerPageChangeEffect({ x: e.clientX, y: e.clientY });
    }
    navigate(route);
    setIsMobileSidebarOpen(false);
  };

  const renderSidebarContent = (isMobile = false) => {
    const showExpanded = isMobile || isSidebarExpanded;
    return (
      <div className="flex flex-col h-full justify-between">
        {/* Top Header / Brand */}
        <div>
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <button
              onClick={(e) => handleNavClick('home', e)}
              className="flex items-center gap-2.5 text-left group transition-all cursor-pointer overflow-hidden"
            >
              <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-black font-black shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                <Clapperboard className="w-4 h-4 text-black" />
              </div>
              {showExpanded && (
                <div className="flex items-baseline truncate">
                  <span className="font-courier font-bold tracking-wider text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                    STUTTER<span className="text-amber-400">FRAME</span>
                  </span>
                </div>
              )}
            </button>

            {/* Desktop collapse toggle */}
            {!isMobile && (
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
                title={isSidebarExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
              >
                {isSidebarExpanded ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mobile close button */}
            {isMobile && (
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Link List */}
          <div className="p-2 sm:p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={(e) => handleNavClick(item.id, e)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer active:scale-95 group touch-manipulation min-h-[44px] ${
                    isActive
                      ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/90'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-black' : 'text-zinc-400 group-hover:text-amber-400'
                    }`}
                  />
                  {showExpanded && (
                    <div className="flex-1 flex items-center justify-between truncate text-left">
                      <span className="truncate">{item.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-mono ${
                          isActive
                            ? 'bg-black/20 text-black font-bold'
                            : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions & Controls */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80 space-y-1.5">
          {/* Assistant Trigger */}
          <button
            onClick={() => {
              setIsMobileSidebarOpen(false);
              openAssistant();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 touch-manipulation min-h-[42px] ${
              !showExpanded ? 'px-2' : ''
            }`}
            title="Ask StutterFrame Assistant"
          >
            <MessageSquare className="w-4 h-4 text-black flex-shrink-0" />
            {showExpanded && <span>Ask AI</span>}
          </button>

          {/* Quick Settings & Customization Grid */}
          <div
            className={`grid gap-1 pt-1 ${
              showExpanded ? 'grid-cols-4' : 'grid-cols-1'
            }`}
          >
            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                openSettings('ui-style');
              }}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
              title="UI Architecture & Movie Themes"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                openSettings('layout');
              }}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
              title="UI Layout Modes"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                openSettings('theme');
              }}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
              title="Color Palette Grading"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                openAbout();
              }}
              className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
              title="Director Credits & Info"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop Permanent Left Sidebar Dock */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-r border-zinc-800 transition-all duration-300 ${
          isSidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Slide-Out Drawer Dock */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-72 max-w-[80vw] bg-[#09090b] border-r border-zinc-800 h-full z-10 animate-slideRight shadow-2xl flex flex-col">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
