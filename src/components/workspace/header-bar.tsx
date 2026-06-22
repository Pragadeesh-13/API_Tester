'use client';

import React from 'react';
import {
  Zap,
  History,
  Variable,
  ExternalLink,
  Mail,
  User,
} from 'lucide-react';
import { Button } from '../ui/button';

interface HeaderBarProps {
  onToggleHistory: () => void;
  onToggleEnvPanel: () => void;
  historyCount: number;
  envCount: number;
}

export function HeaderBar({
  onToggleHistory,
  onToggleEnvPanel,
  historyCount,
  envCount,
}: HeaderBarProps) {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-4 py-3 glass-panel border-b border-white/10 relative z-30 gap-4 md:gap-0">
      {/* Left: Brand + Dev Info */}
      <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 w-full md:w-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-[#F62440] flex items-center justify-center shadow-lg shadow-[#F62440]/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#de1c35] rounded-full animate-pulse border-2 border-white" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-[#1a1515] hidden sm:block">
              API Tester
            </span>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden md:block w-px h-8 bg-white/10" />

        {/* Developer Metadata */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1.5">
            <User className="w-3 h-3" />
            <span className="text-slate-400 font-medium">Developer:</span>
            Pragadeesh Kumar T
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3 h-3" />
            <span className="text-slate-400 font-medium">Contact:</span>
            <a
              href="mailto:tpragadeeshkumar@gmail.com"
              className="text-[#F62440] hover:text-[#de1c35] transition-colors"
            >
              tpragadeeshkumar@gmail.com
            </a>
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 w-full md:w-auto">
        {/* History Toggle */}
        <Button variant="ghost" size="sm" onClick={onToggleHistory} className="relative glass-button text-slate-300 hover:text-white">
          <History className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">History</span>
          {historyCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {historyCount > 9 ? '9+' : historyCount}
            </span>
          )}
        </Button>

        {/* Environment Panel Toggle */}
        <Button variant="ghost" size="sm" onClick={onToggleEnvPanel} className="relative glass-button text-slate-300 hover:text-white">
          <Variable className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Environment</span>
          {envCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {envCount}
            </span>
          )}
        </Button>

        {/* Separator */}
        <div className="w-px h-6 bg-white/10 hidden sm:block" />

        {/* Built for Digital Heroes Button */}
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          id="digital-heroes-link"
          className="
            inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg
            glass-button-primary text-white
          "
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Built for Digital Heroes</span>
          <ExternalLink className="w-3 h-3 opacity-60 hidden sm:inline" />
        </a>
      </div>
    </header>
  );
}
