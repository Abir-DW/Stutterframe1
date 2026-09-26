/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { MoviePicker } from './components/MoviePicker';
import { ShotRater } from './components/ShotRater';
import { ScriptLab } from './components/ScriptLab';
import { GearSuggestor } from './components/GearSuggestor';
import { EditorAdvisor } from './components/EditorAdvisor';
import { FaqView } from './components/FaqView';
import { AssistantDrawer } from './components/AssistantDrawer';
import { AboutModal } from './components/AboutModal';
import { SettingsModal } from './components/SettingsModal';
import { CustomCursor } from './components/CustomCursor';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Settings } from 'lucide-react';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { openSettings, triggerPageChangeEffect } = useSettings();

  // Sync initial URL path / hash with state
  useEffect(() => {
    const parseRoute = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const path = window.location.pathname.replace(/^\//, '');
      const validRoutes = [
        'movie-picker',
        'shot-rater',
        'script-lab',
        'gear-suggestor',
        'editor-advisor',
        'faq',
      ];

      if (validRoutes.includes(hash)) {
        setCurrentRoute(hash);
      } else if (validRoutes.includes(path)) {
        setCurrentRoute(path);
      } else {
        setCurrentRoute('home');
      }
    };

    parseRoute();
    window.addEventListener('popstate', parseRoute);
    return () => window.removeEventListener('popstate', parseRoute);
  }, []);

  const navigate = (route: string, clickPos?: { x: number; y: number }) => {
    if (clickPos) {
      triggerPageChangeEffect(clickPos);
    }
    setCurrentRoute(route);
    const targetUrl = route === 'home' ? '/' : `/${route}`;
    window.history.pushState({}, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-[#f4f4f5] flex flex-col relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. Film Grain Overlay */}
      <div className="film-grain" />

      {/* 2. Cinematic Soft Vignette */}
      <div className="cinema-vignette" />

      {/* 3. Custom PC Cinematic Cursor (Camera with flash, Slate with clap, or Default) */}
      <CustomCursor />

      {/* Sticky Header with wordmark, themes, and tools */}
      <Header
        currentRoute={currentRoute}
        navigate={(route) => navigate(route)}
        openAssistant={() => setIsAssistantOpen(true)}
        openAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 pt-2">
        {currentRoute === 'home' && <HomeView navigate={(route) => navigate(route)} />}
        {currentRoute === 'movie-picker' && <MoviePicker />}
        {currentRoute === 'shot-rater' && <ShotRater />}
        {currentRoute === 'script-lab' && <ScriptLab />}
        {currentRoute === 'gear-suggestor' && <GearSuggestor />}
        {currentRoute === 'editor-advisor' && <EditorAdvisor />}
        {currentRoute === 'faq' && <FaqView />}
      </main>

      {/* Tool 5: StutterFrame Assistant (Fixed button & drawer on every page) */}
      <AssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onOpen={() => setIsAssistantOpen(true)}
      />

      {/* Director Credits & About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Comprehensive Preferences & Settings Modal (Cursor, Themes, Credits) */}
      <SettingsModal />

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-900 bg-[#070709] py-8 text-center text-xs font-mono text-zinc-500 relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-courier font-bold text-zinc-300">STUTTERFRAME</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-zinc-500">
            <span>By Abir D.W</span>
            <span>&bull;</span>
            <button
              onClick={() => openSettings('credits')}
              className="text-amber-400/90 hover:text-amber-300 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Credits &amp; Director
            </button>
            <span>&bull;</span>
            <button
              onClick={() => openSettings('cursor')}
              className="text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>Preferences (Cursor &amp; Theme)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={(e) => navigate('home', { x: e.clientX, y: e.clientY })}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={(e) => navigate('movie-picker', { x: e.clientX, y: e.clientY })}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Movie Picker
            </button>
            <button
              onClick={(e) => navigate('shot-rater', { x: e.clientX, y: e.clientY })}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Shot Rater
            </button>
            <button
              onClick={(e) => navigate('script-lab', { x: e.clientX, y: e.clientY })}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Script Lab
            </button>
            <button
              onClick={(e) => navigate('gear-suggestor', { x: e.clientX, y: e.clientY })}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Gear Suggestor
            </button>
            <button
              onClick={(e) => navigate('editor-advisor', { x: e.clientX, y: e.clientY })}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Editing Help
            </button>
            <button
              onClick={(e) => navigate('faq', { x: e.clientX, y: e.clientY })}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              FAQ &amp; Vault
            </button>
            <button
              onClick={() => openSettings('credits')}
              className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer font-bold"
            >
              About
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppContent />
    </SettingsProvider>
  );
}
