'use client';

import React from 'react';
import {
  X,
  Trash2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/button';
import type { HistoryEntry, HttpMethod } from '@/lib/types';
import { getMethodConfig } from '@/lib/constants';

interface HistorySidebarProps {
  isOpen: boolean;
  history: HistoryEntry[];
  onClose: () => void;
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export function HistorySidebar({
  isOpen,
  history,
  onClose,
  onSelect,
  onClear,
}: HistorySidebarProps) {
  function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function truncateUrl(url: string, maxLen: number = 40): string {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname + parsed.search;
      const display = parsed.hostname + path;
      return display.length > maxLen ? display.substring(0, maxLen) + '...' : display;
    } catch {
      return url.length > maxLen ? url.substring(0, maxLen) + '...' : url;
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-80 bg-[#FFFAF3] border-r border-slate-200
          shadow-2xl shadow-black/10 z-50 transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div>
            <h2 className="text-sm font-semibold text-[#1a1515]">Request History</h2>
            <p className="text-[10px] text-gray-500 mt-0.5">{history.length} saved requests</p>
          </div>
          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <Button variant="danger" size="sm" onClick={onClear}>
                <Trash2 className="w-3 h-3" />
                Clear
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar h-[calc(100%-56px)]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Clock className="w-10 h-10 opacity-20 mb-2" />
              <p className="text-xs">No history yet</p>
              <p className="text-[10px] mt-1 text-gray-400">Your requests will appear here</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {history.map((entry) => {
                const methodConf = getMethodConfig(entry.method as HttpMethod);
                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      onSelect(entry);
                      onClose();
                    }}
                    className="
                      w-full text-left px-3 py-2.5 rounded-lg
                      hover:bg-[#FFF2DB] transition-all duration-150 cursor-pointer
                      group border border-transparent hover:border-slate-200
                    "
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold ${methodConf.color} ${methodConf.bg} px-1.5 py-0.5 rounded`}>
                        {entry.method}
                      </span>
                      {entry.status && (
                        <span className={`text-[10px] font-medium ${
                          entry.status >= 200 && entry.status < 300
                            ? 'text-emerald-600'
                            : entry.status >= 400
                            ? 'text-amber-600'
                            : 'text-gray-500'
                        }`}>
                          {entry.status}
                        </span>
                      )}
                      {entry.latency && (
                        <span className="text-[10px] text-gray-500">{entry.latency.toFixed(0)}ms</span>
                      )}
                      <span className="text-[10px] text-gray-400 ml-auto">{formatTime(entry.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-mono truncate group-hover:text-gray-800 transition-colors">
                      {truncateUrl(entry.url)}
                    </p>
                    <ExternalLink className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
