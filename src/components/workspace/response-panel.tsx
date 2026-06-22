'use client';

import React from 'react';
import {
  Copy,
  Check,
  Clock,
  HardDrive,
  FileCode,
  Terminal,
  Eye,
  TableProperties,
  Braces,
  Inbox,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Tabs } from '../ui/tabs';
import { Button } from '../ui/button';
import type { ProxyResponse, ResponseTab, KeyValuePair, HttpMethod } from '@/lib/types';
import { getStatusColor } from '@/lib/constants';
import { generateFetchSnippet, generateCurlSnippet } from '@/lib/code-generator';

interface ResponsePanelProps {
  response: ProxyResponse | null;
  error: string | null;
  loading: boolean;
  activeTab: ResponseTab;
  onTabChange: (tab: ResponseTab) => void;
  // Current request state for code gen
  requestUrl: string;
  requestMethod: HttpMethod;
  requestHeaders: KeyValuePair[];
  requestBody: string;
}

export function ResponsePanel({
  response,
  error,
  loading,
  activeTab,
  onTabChange,
  requestUrl,
  requestMethod,
  requestHeaders,
  requestBody,
}: ResponsePanelProps) {
  const [copied, setCopied] = React.useState<string | null>(null);
  const [codeGenTab, setCodeGenTab] = React.useState<'fetch' | 'curl'>('fetch');

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback
    }
  };

  const responseTabs = [
    { id: 'pretty', label: 'Pretty JSON', icon: <Braces className="w-3 h-3" /> },
    { id: 'preview', label: 'Preview', icon: <Eye className="w-3 h-3" /> },
    { id: 'headers', label: 'Headers', icon: <TableProperties className="w-3 h-3" />, count: response ? Object.keys(response.headers).length : undefined },
    { id: 'codegen', label: 'Code Gen', icon: <FileCode className="w-3 h-3" /> },
  ];

  // ── Format bytes ───────────────────────────────────────────────────────
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  // ── Syntax Highlight JSON ──────────────────────────────────────────────
  function syntaxHighlightJson(json: string): string {
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let cls = 'text-amber-300'; // number
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'text-blue-400'; // key
          } else {
            cls = 'text-[#F62440]'; // string
          }
        } else if (/true|false/.test(match)) {
          cls = 'text-purple-400'; // boolean
        } else if (/null/.test(match)) {
          cls = 'text-red-400'; // null
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
  }

  // ── Get formatted body string ──────────────────────────────────────────
  function getFormattedBody(): string {
    if (!response) return '';
    if (typeof response.body === 'object' && response.body !== null) {
      return JSON.stringify(response.body, null, 2);
    }
    // Try parsing as JSON string
    if (typeof response.body === 'string') {
      try {
        return JSON.stringify(JSON.parse(response.body), null, 2);
      } catch {
        return response.body;
      }
    }
    return String(response.body);
  }

  const isJson = response?.contentType?.includes('json');
  const isHtml = response?.contentType?.includes('html');

  return (
    <div className="flex flex-col h-full glass-panel rounded-xl overflow-hidden shadow-2xl shadow-black/50">
      {/* ── Performance HUD ─────────────────────────────────────────────── */}
      {response && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
          {/* Status Badge */}
          <Badge
            variant={
              response.status >= 200 && response.status < 300
                ? 'success'
                : response.status >= 400 && response.status < 500
                ? 'warning'
                : response.status >= 500
                ? 'danger'
                : 'info'
            }
          >
            <span className="font-bold">{response.status}</span>
            <span className="opacity-75">{response.statusText}</span>
          </Badge>

          {/* Latency Badge */}
          <Badge variant="default">
            <Clock className="w-3 h-3" />
            {response.latency.toFixed(1)} ms
          </Badge>

          {/* Size Badge */}
          <Badge variant="default">
            <HardDrive className="w-3 h-3" />
            {formatBytes(response.size)}
          </Badge>

          {/* Content Type */}
          <span className="text-[10px] text-slate-600 font-mono ml-auto">
            {response.contentType || 'unknown'}
          </span>
        </div>
      )}

      {/* ── Error Display ───────────────────────────────────────────────── */}
      {error && !response && (
        <div className="flex items-start gap-3 px-4 py-3 border-b border-red-500/20 bg-red-500/5">
          <div className="w-2 h-2 rounded-full bg-red-500 mt-1 animate-pulse" />
          <div>
            <p className="text-xs font-semibold text-red-400">Request Failed</p>
            <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <Tabs
        tabs={responseTabs}
        activeTab={activeTab}
        onTabChange={(id) => onTabChange(id as ResponseTab)}
      />

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-[#F62440]/20 rounded-full" />
              <div className="absolute inset-0 w-10 h-10 border-2 border-transparent border-t-[#F62440] rounded-full animate-spin" />
            </div>
            <p className="text-xs text-slate-500 animate-pulse">Executing request...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !response && !error && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
            <Inbox className="w-12 h-12 opacity-20" />
            <div className="text-center">
              <p className="text-xs font-medium">No response yet</p>
              <p className="text-[10px] mt-1 text-slate-700">Send a request to see the response here</p>
            </div>
          </div>
        )}

        {/* Pretty JSON Tab */}
        {!loading && response && activeTab === 'pretty' && (
          <div className="relative h-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(getFormattedBody(), 'response')}
              className="absolute top-2 right-2 z-10"
            >
              {copied === 'response' ? (
                <Check className="w-3 h-3 text-[#F62440]" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied === 'response' ? 'Copied!' : 'Copy Response'}
            </Button>
            <pre className="h-full overflow-auto p-4 text-xs font-mono custom-scrollbar">
              {isJson ? (
                <code
                  dangerouslySetInnerHTML={{
                    __html: syntaxHighlightJson(getFormattedBody()),
                  }}
                />
              ) : (
                <code className="text-slate-300">{getFormattedBody()}</code>
              )}
            </pre>
          </div>
        )}

        {/* Preview Tab */}
        {!loading && response && activeTab === 'preview' && (
          <div className="h-full p-3">
            {isHtml ? (
              <iframe
                srcDoc={typeof response.body === 'string' ? response.body : String(response.body)}
                className="w-full h-full bg-white rounded-lg border border-slate-700"
                sandbox="allow-same-origin"
                title="HTML Preview"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600">
                <Eye className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-xs">Preview is available for HTML responses</p>
                <p className="text-[10px] mt-1 text-slate-700">
                  Current content type: {response.contentType || 'unknown'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Headers Tab */}
        {!loading && response && activeTab === 'headers' && (
          <div className="h-full overflow-auto p-3 custom-scrollbar">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 px-3 text-slate-500 font-medium uppercase tracking-wider text-[10px]">Header</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-medium uppercase tracking-wider text-[10px]">Value</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(response.headers).map(([key, value]) => (
                  <tr key={key} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 text-blue-400 font-mono font-medium">{key}</td>
                    <td className="py-2 px-3 text-slate-300 font-mono break-all">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Code Generator Tab */}
        {!loading && activeTab === 'codegen' && (
          <div className="h-full flex flex-col">
            {/* Sub-tabs */}
            <div className="flex items-center gap-1 px-3 pt-2">
              <button
                onClick={() => setCodeGenTab('fetch')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  codeGenTab === 'fetch'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-3 h-3" />
                  JavaScript fetch()
                </span>
              </button>
              <button
                onClick={() => setCodeGenTab('curl')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  codeGenTab === 'curl'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" />
                  cURL
                </span>
              </button>
            </div>

            {/* Code Output */}
            <div className="relative flex-1 m-3 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const code =
                    codeGenTab === 'fetch'
                      ? generateFetchSnippet(requestUrl, requestMethod, requestHeaders, requestBody)
                      : generateCurlSnippet(requestUrl, requestMethod, requestHeaders, requestBody);
                  copyToClipboard(code, 'codegen');
                }}
                className="absolute top-2 right-2 z-10"
              >
                {copied === 'codegen' ? (
                  <Check className="w-3 h-3 text-[#F62440]" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                {copied === 'codegen' ? 'Copied!' : 'Copy'}
              </Button>
              <pre className="h-full overflow-auto p-4 text-xs font-mono text-slate-300 custom-scrollbar">
                {codeGenTab === 'fetch'
                  ? generateFetchSnippet(requestUrl, requestMethod, requestHeaders, requestBody)
                  : generateCurlSnippet(requestUrl, requestMethod, requestHeaders, requestBody)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
