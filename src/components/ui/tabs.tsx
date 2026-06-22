'use client';

import React from 'react';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`flex items-center gap-0.5 border-b border-slate-800 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-4 py-2.5 text-xs font-medium transition-all duration-150
              ${isActive
                ? 'text-[#F62440]'
                : 'text-slate-500 hover:text-slate-300'
              }
            `}
          >
            <span className="flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className={`
                  px-1.5 py-0.5 text-[10px] rounded-full font-semibold
                  ${isActive ? 'bg-[#F62440]/20 text-[#F62440]' : 'bg-slate-700 text-slate-500'}
                `}>
                  {tab.count}
                </span>
              )}
            </span>
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F62440] rounded-t-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
