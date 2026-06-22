'use client';

import React from 'react';
import { X, Plus, Trash2, Variable, Info } from 'lucide-react';
import { Button } from '../ui/button';
import type { EnvVariable } from '@/lib/types';
import { generateId } from '@/lib/constants';

interface EnvPanelProps {
  isOpen: boolean;
  envVars: EnvVariable[];
  onClose: () => void;
  onChange: (envVars: EnvVariable[]) => void;
}

export function EnvPanel({ isOpen, envVars, onClose, onChange }: EnvPanelProps) {
  const addVar = () => {
    onChange([...envVars, { id: generateId(), key: '', value: '' }]);
  };

  const updateVar = (id: string, field: 'key' | 'value', val: string) => {
    onChange(envVars.map((v) => (v.id === id ? { ...v, [field]: val } : v)));
  };

  const removeVar = (id: string) => {
    onChange(envVars.filter((v) => v.id !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] max-h-[80vh] bg-[#FFFAF3] border border-slate-200 rounded-2xl shadow-2xl shadow-black/10 z-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFE5BF]/50 border border-[#FFE5BF] flex items-center justify-center">
              <Variable className="w-4 h-4 text-[#F62440]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1a1515]">Environment Variables</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">
                Use <code className="text-[#F62440] bg-[#FFF2DB] px-1 rounded">{'{{variableName}}'}</code> syntax in URLs and headers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-md transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="mx-5 mt-4 p-3 bg-[#FFF2DB] border border-[#FFE5BF] rounded-lg flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-[#F62440] mt-0.5 shrink-0" />
          <p className="text-[11px] text-gray-700">
            Variables are automatically substituted before each request. For example, setting{' '}
            <code className="text-[#F62440] font-semibold">baseUrl</code> to{' '}
            <code className="text-[#F62440] font-semibold">https://jsonplaceholder.typicode.com</code> lets you use{' '}
            <code className="text-[#F62440] font-semibold">{'{{baseUrl}}/posts'}</code> in the URL field.
          </p>
        </div>

        {/* Variable Rows */}
        <div className="p-5 space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
          {/* Table Header */}
          {envVars.length > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="flex-1 text-[10px] text-gray-600 font-medium uppercase tracking-wider px-3">Variable Name</span>
              <span className="flex-1 text-[10px] text-gray-600 font-medium uppercase tracking-wider px-3">Value</span>
              <span className="w-8" />
            </div>
          )}

          {envVars.map((envVar) => (
            <div key={envVar.id} className="flex items-center gap-2 group">
              <input
                type="text"
                value={envVar.key}
                onChange={(e) => updateVar(envVar.id, 'key', e.target.value)}
                placeholder="variableName"
                className="flex-1 px-3 py-2 text-xs bg-[#ffffff] border border-gray-300 rounded-lg text-[#1a1515] placeholder-gray-400 focus:outline-none transition-all font-mono"
              />
              <input
                type="text"
                value={envVar.value}
                onChange={(e) => updateVar(envVar.id, 'value', e.target.value)}
                placeholder="value"
                className="flex-1 px-3 py-2 text-xs bg-[#ffffff] border border-gray-300 rounded-lg text-[#1a1515] placeholder-gray-400 focus:outline-none transition-all font-mono"
              />
              <button
                onClick={() => removeVar(envVar.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {envVars.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Variable className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-xs">No environment variables defined</p>
              <p className="text-[10px] mt-1 text-gray-400">Click &quot;Add Variable&quot; to get started</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-[#FFFAF3]/80">
          <Button variant="ghost" size="sm" onClick={addVar}>
            <Plus className="w-3 h-3" />
            Add Variable
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </>
  );
}
