'use client';

import React from 'react';
import {
  Send,
  Plus,
  Trash2,
  ChevronDown,
  Loader2,
  Lock,
  KeyRound,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs } from '../ui/tabs';
import type {
  HttpMethod,
  KeyValuePair,
  AuthType,
  RequestTab,
} from '@/lib/types';
import {
  HTTP_METHODS,
  getMethodConfig,
  methodSupportsBody,
  generateId,
} from '@/lib/constants';

interface RequestPanelProps {
  url: string;
  method: HttpMethod;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
  authType: AuthType;
  authToken: string;
  authUsername: string;
  authPassword: string;
  activeTab: RequestTab;
  loading: boolean;
  onUrlChange: (url: string) => void;
  onMethodChange: (method: HttpMethod) => void;
  onHeadersChange: (headers: KeyValuePair[]) => void;
  onParamsChange: (params: KeyValuePair[]) => void;
  onBodyChange: (body: string) => void;
  onAuthTypeChange: (type: AuthType) => void;
  onAuthTokenChange: (token: string) => void;
  onAuthUsernameChange: (username: string) => void;
  onAuthPasswordChange: (password: string) => void;
  onTabChange: (tab: RequestTab) => void;
  onSend: () => void;
}

export function RequestPanel({
  url,
  method,
  headers,
  params,
  body,
  authType,
  authToken,
  authUsername,
  authPassword,
  activeTab,
  loading,
  onUrlChange,
  onMethodChange,
  onHeadersChange,
  onParamsChange,
  onBodyChange,
  onAuthTypeChange,
  onAuthTokenChange,
  onAuthUsernameChange,
  onAuthPasswordChange,
  onTabChange,
  onSend,
}: RequestPanelProps) {
  const methodConfig = getMethodConfig(method);
  const [showMethodDropdown, setShowMethodDropdown] = React.useState(false);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handler = () => setShowMethodDropdown(false);
    if (showMethodDropdown) {
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  }, [showMethodDropdown]);

  const requestTabs = [
    { id: 'params', label: 'Params', count: params.filter((p) => p.enabled && p.key).length },
    { id: 'headers', label: 'Headers', count: headers.filter((h) => h.enabled && h.key).length },
    { id: 'auth', label: 'Auth', count: authType !== 'none' ? 1 : undefined },
    { id: 'body', label: 'Body' },
  ];

  // ── Key-Value Row Builder ────────────────────────────────────────────
  function renderKvRows(
    items: KeyValuePair[],
    onChange: (items: KeyValuePair[]) => void,
    keyPlaceholder: string = 'Key',
    valuePlaceholder: string = 'Value'
  ) {
    const addRow = () => {
      onChange([...items, { id: generateId(), key: '', value: '', enabled: true }]);
    };

    const updateRow = (id: string, field: keyof KeyValuePair, val: string | boolean) => {
      onChange(items.map((item) => (item.id === id ? { ...item, [field]: val } : item)));
    };

    const removeRow = (id: string) => {
      onChange(items.filter((item) => item.id !== id));
    };

    return (
      <div className="space-y-1.5 p-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => updateRow(item.id, 'enabled', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-[#F62440] focus:ring-[#F62440]/20 cursor-pointer accent-[#F62440]"
            />
            <input
              type="text"
              value={item.key}
              onChange={(e) => updateRow(item.id, 'key', e.target.value)}
              placeholder={keyPlaceholder}
              className="flex-1 px-3 py-1.5 text-xs bg-[#ffffff] text-[#1a1515] placeholder-gray-400 focus:outline-none border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => updateRow(item.id, 'value', e.target.value)}
              placeholder={valuePlaceholder}
              className="flex-1 px-3 py-1.5 text-xs bg-[#ffffff] text-[#1a1515] placeholder-gray-400 focus:outline-none border border-gray-300 rounded-md"
            />
            <button
              onClick={() => removeRow(item.id)}
              className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addRow} className="mt-1">
          <Plus className="w-3 h-3" />
          Add Row
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full glass-panel rounded-xl overflow-hidden shadow-2xl shadow-black/50">
      {/* ── URL Bar ───────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex flex-wrap md:flex-nowrap items-center gap-2 p-3 border-b border-white/10">
        {/* Method Selector */}
        <div className="relative z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMethodDropdown(!showMethodDropdown);
            }}
            className={`
              flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border
              transition-all duration-150 cursor-pointer min-w-[90px] justify-between
              ${methodConfig.bg} text-white ${methodConfig.border}
            `}
          >
            {method}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showMethodDropdown && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-[#FFFAF3] rounded-lg shadow-xl shadow-black/10 z-50 overflow-hidden border border-slate-200">
              {HTTP_METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => {
                    onMethodChange(m.value);
                    setShowMethodDropdown(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2 text-xs font-semibold
                    hover:bg-[#FFF2DB] transition-colors cursor-pointer
                    ${m.color} ${method === m.value ? 'bg-[#FFF2DB]' : ''}
                  `}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* URL Input */}
        <input
          type="text"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) onSend();
          }}
          placeholder="Enter request URL or paste a cURL command..."
          id="url-input"
          className="flex-1 min-w-[200px] px-4 py-2 text-sm bg-[#ffffff] border border-gray-300 rounded-lg text-[#1a1515] placeholder-gray-400 focus:outline-none transition-all font-mono"
        />

        {/* Send Button */}
        <Button
          variant="primary"
          size="md"
          onClick={onSend}
          disabled={loading || !url.trim()}
          id="send-button"
          className="w-full md:w-auto min-w-[80px]"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Send
            </>
          )}
        </Button>
      </div>

      {/* ── Config Tabs ───────────────────────────────────────────────────── */}
      <Tabs
        tabs={requestTabs}
        activeTab={activeTab}
        onTabChange={(id) => onTabChange(id as RequestTab)}
      />

      {/* ── Tab Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'params' && renderKvRows(params, onParamsChange, 'Parameter', 'Value')}

        {activeTab === 'headers' && renderKvRows(headers, onHeadersChange, 'Header Name', 'Header Value')}

        {activeTab === 'auth' && (
          <div className="p-3 space-y-4">
            {/* Auth Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Authorization Type</label>
              <select
                value={authType}
                onChange={(e) => onAuthTypeChange(e.target.value as AuthType)}
                className="w-full px-3 py-2 text-xs bg-[#ffffff] text-[#1a1515] focus:outline-none border border-gray-300 rounded-lg appearance-none cursor-pointer"
              >
                <option value="none">No Authentication</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>

            {authType === 'bearer' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Bearer Token
                </label>
                <input
                  type="password"
                  value={authToken}
                  onChange={(e) => onAuthTokenChange(e.target.value)}
                  placeholder="Enter your bearer token..."
                  className="w-full px-3 py-2 text-xs bg-[#ffffff] text-[#1a1515] placeholder-gray-400 focus:outline-none border border-gray-300 rounded-lg font-mono"
                />
                <p className="text-[10px] text-slate-600">
                  Token will be sent as: <code className="text-blue-400">Authorization: Bearer &lt;token&gt;</code>
                </p>
              </div>
            )}

            {authType === 'basic' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <KeyRound className="w-3 h-3" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => onAuthUsernameChange(e.target.value)}
                    placeholder="Username"
                    className="w-full px-3 py-2 text-xs bg-[#ffffff] text-[#1a1515] placeholder-gray-400 focus:outline-none border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Password</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => onAuthPasswordChange(e.target.value)}
                    placeholder="Password"
                    className="w-full px-3 py-2 text-xs bg-[#ffffff] text-[#1a1515] placeholder-gray-400 focus:outline-none border border-gray-300 rounded-lg"
                  />
                </div>
                <p className="text-[10px] text-slate-600">
                  Credentials will be Base64-encoded and sent as: <code className="text-blue-400">Authorization: Basic &lt;encoded&gt;</code>
                </p>
              </div>
            )}

            {authType === 'none' && (
              <div className="flex flex-col items-center justify-center py-8 text-slate-600">
                <Lock className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">No authentication configured</p>
                <p className="text-[10px] mt-1">Select an auth type from the dropdown above</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'body' && (
          <div className="p-3 h-full">
            {methodSupportsBody(method) ? (
              <div className="space-y-1.5 h-full">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">Request Body (JSON)</label>
                  <button
                    onClick={() => {
                      try {
                        const formatted = JSON.stringify(JSON.parse(body), null, 2);
                        onBodyChange(formatted);
                      } catch {
                        /* ignore invalid JSON */
                      }
                    }}
                    className="text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                  >
                    Prettify
                  </button>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => onBodyChange(e.target.value)}
                  placeholder='{\n  "key": "value"\n}'
                  className="w-full h-[calc(100%-24px)] min-h-[200px] px-3 py-2 text-xs bg-[#ffffff] text-[#1a1515] placeholder-gray-400 focus:outline-none border border-gray-300 rounded-lg font-mono resize-none custom-scrollbar"
                  spellCheck={false}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                <p className="text-xs">Body is not available for {method} requests</p>
                <p className="text-[10px] mt-1 text-slate-700">
                  Switch to POST, PUT, PATCH, or DELETE to add a request body
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
