'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HeaderBar } from '@/components/workspace/header-bar';
import { RequestPanel } from '@/components/workspace/request-panel';
import { ResponsePanel } from '@/components/workspace/response-panel';
import { HistorySidebar } from '@/components/workspace/history-sidebar';
import { EnvPanel } from '@/components/workspace/env-panel';
import { useRequest } from '@/hooks/use-request';
import { loadHistory, clearHistory as clearStorageHistory, loadEnvVars, saveEnvVars } from '@/lib/storage';
import { generateId } from '@/lib/constants';
import type {
  HttpMethod,
  KeyValuePair,
  AuthType,
  EnvVariable,
  RequestTab,
  ResponseTab,
  HistoryEntry,
} from '@/lib/types';

export default function WorkspacePage() {
  // ── Request State ──────────────────────────────────────────────────────
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<KeyValuePair[]>([]);
  const [params, setParams] = useState<KeyValuePair[]>([]);
  const [body, setBody] = useState('');
  const [authType, setAuthType] = useState<AuthType>('none');
  const [authToken, setAuthToken] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [mounted, setMounted] = useState(false);

  // ── UI State ───────────────────────────────────────────────────────────
  const [requestTab, setRequestTab] = useState<RequestTab>('params');
  const [responseTab, setResponseTab] = useState<ResponseTab>('pretty');
  const [showHistory, setShowHistory] = useState(false);
  const [showEnvPanel, setShowEnvPanel] = useState(false);
  const [envVars, setEnvVars] = useState<EnvVariable[]>([]);
  const [splitPosition, setSplitPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Request Hook ───────────────────────────────────────────────────────
  const {
    response,
    error,
    loading,
    history,
    executeRequest,
    setHistory,
  } = useRequest([]);

  // ── Load persisted state & initialize client-only IDs ───────────────
  useEffect(() => {
    const savedHistory = loadHistory();
    setHistory(savedHistory);
    const savedEnvVars = loadEnvVars();
    setEnvVars(savedEnvVars);
    // Add initial empty rows (client-only to avoid hydration mismatch)
    setHeaders([{ id: generateId(), key: '', value: '', enabled: true }]);
    setParams([{ id: generateId(), key: '', value: '', enabled: true }]);
    setMounted(true);
  }, [setHistory]);

  // ── Persist env vars ───────────────────────────────────────────────────
  const handleEnvVarsChange = useCallback((newVars: EnvVariable[]) => {
    setEnvVars(newVars);
    saveEnvVars(newVars);
  }, []);

  // ── Send Request ───────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    executeRequest(
      {
        url,
        method,
        headers,
        params,
        body,
        authType,
        authToken,
        authUsername,
        authPassword,
      },
      envVars
    );
  }, [url, method, headers, params, body, authType, authToken, authUsername, authPassword, envVars, executeRequest]);

  // ── Load History Entry ─────────────────────────────────────────────────
  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setUrl(entry.url);
    setMethod(entry.method);
    setHeaders(entry.headers?.length ? entry.headers : [{ id: generateId(), key: '', value: '', enabled: true }]);
    setParams(entry.params?.length ? entry.params : [{ id: generateId(), key: '', value: '', enabled: true }]);
    setBody(entry.body || '');
    setAuthType(entry.authType || 'none');
    setAuthToken(entry.authToken || '');
    setAuthUsername(entry.authUsername || '');
    setAuthPassword(entry.authPassword || '');
  }, []);

  // ── Clear History ──────────────────────────────────────────────────────
  const handleClearHistory = useCallback(() => {
    clearStorageHistory();
    setHistory([]);
  }, [setHistory]);

  // ── Split Pane Resizer ─────────────────────────────────────────────────
  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const position = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPosition(Math.min(Math.max(position, 25), 75));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="h-screen flex flex-col bg-transparent overflow-hidden">
      {/* ── Header Bar ──────────────────────────────────────────────────── */}
      <HeaderBar
        onToggleHistory={() => setShowHistory((prev) => !prev)}
        onToggleEnvPanel={() => setShowEnvPanel((prev) => !prev)}
        historyCount={history.length}
        envCount={envVars.filter((v) => v.key).length}
      />

      {/* ── Main Workspace ──────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-2 md:p-4 gap-4 md:gap-0"
        style={{ cursor: isResizing ? 'col-resize' : undefined }}
      >
        {/* Left Pane: Request */}
        <div
          className="pane-left flex flex-col md:overflow-hidden"
          style={{ width: `${splitPosition}%` }}
        >
          <RequestPanel
            url={url}
            method={method}
            headers={headers}
            params={params}
            body={body}
            authType={authType}
            authToken={authToken}
            authUsername={authUsername}
            authPassword={authPassword}
            activeTab={requestTab}
            loading={loading}
            onUrlChange={setUrl}
            onMethodChange={setMethod}
            onHeadersChange={setHeaders}
            onParamsChange={setParams}
            onBodyChange={setBody}
            onAuthTypeChange={setAuthType}
            onAuthTokenChange={setAuthToken}
            onAuthUsernameChange={setAuthUsername}
            onAuthPasswordChange={setAuthPassword}
            onTabChange={setRequestTab}
            onSend={handleSend}
          />
        </div>

        {/* Resize Handle */}
        <div
          className="resize-handle w-2 flex-shrink-0 hover:bg-emerald-500/10 transition-colors mx-1 rounded-full hidden md:block"
          onMouseDown={handleMouseDown}
        />

        {/* Right Pane: Response */}
        <div
          className="pane-right flex flex-col md:overflow-hidden"
          style={{ width: `${100 - splitPosition}%` }}
        >
          <ResponsePanel
            response={response}
            error={error}
            loading={loading}
            activeTab={responseTab}
            onTabChange={setResponseTab}
            requestUrl={url}
            requestMethod={method}
            requestHeaders={headers}
            requestBody={body}
          />
        </div>
      </div>

      {/* ── Mobile Developer Info (visible on small screens) ────────────── */}
      <div className="md:hidden px-4 py-3 border-t border-white/10 glass-panel mt-auto">
        <p className="text-[10px] text-slate-300 text-center font-medium">
          Developer: Pragadeesh Kumar T | Contact: tpragadeeshkumar@gmail.com
        </p>
      </div>

      {/* ── History Sidebar ─────────────────────────────────────────────── */}
      <HistorySidebar
        isOpen={showHistory}
        history={history}
        onClose={() => setShowHistory(false)}
        onSelect={handleHistorySelect}
        onClear={handleClearHistory}
      />

      {/* ── Environment Panel ───────────────────────────────────────────── */}
      <EnvPanel
        isOpen={showEnvPanel}
        envVars={envVars}
        onClose={() => setShowEnvPanel(false)}
        onChange={handleEnvVarsChange}
      />
    </div>
  );
}
