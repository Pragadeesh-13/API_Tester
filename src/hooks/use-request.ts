'use client';

import { useState, useCallback } from 'react';
import type {
  RequestConfig,
  ProxyResponse,
  ProxyPayload,
  KeyValuePair,
  EnvVariable,
  HistoryEntry,
} from '@/lib/types';
import { interpolateEnvVars } from '@/lib/env-interpolation';
import { generateId, methodSupportsBody } from '@/lib/constants';
import { addHistoryEntry } from '@/lib/storage';

interface UseRequestReturn {
  response: ProxyResponse | null;
  error: string | null;
  loading: boolean;
  history: HistoryEntry[];
  executeRequest: (config: RequestConfig, envVars: EnvVariable[]) => Promise<void>;
  setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  clearResponse: () => void;
}

export function useRequest(initialHistory: HistoryEntry[] = []): UseRequestReturn {
  const [response, setResponse] = useState<ProxyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(initialHistory);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  const executeRequest = useCallback(
    async (config: RequestConfig, envVars: EnvVariable[]) => {
      setLoading(true);
      setError(null);
      setResponse(null);

      try {
        // ── Interpolate environment variables ────────────────────────────
        let finalUrl = interpolateEnvVars(config.url, envVars);

        // ── Build query params from params rows ──────────────────────────
        const activeParams = config.params.filter((p) => p.enabled && p.key);
        if (activeParams.length > 0) {
          const url = new URL(finalUrl);
          activeParams.forEach((p) => {
            url.searchParams.set(
              interpolateEnvVars(p.key, envVars),
              interpolateEnvVars(p.value, envVars)
            );
          });
          finalUrl = url.toString();
        }

        // ── Build headers map ────────────────────────────────────────────
        const headerMap: Record<string, string> = {};
        const activeHeaders = config.headers.filter((h) => h.enabled && h.key);
        activeHeaders.forEach((h) => {
          headerMap[interpolateEnvVars(h.key, envVars)] = interpolateEnvVars(h.value, envVars);
        });

        // ── Inject auth header ───────────────────────────────────────────
        if (config.authType === 'bearer' && config.authToken) {
          headerMap['Authorization'] = `Bearer ${config.authToken}`;
        } else if (config.authType === 'basic' && config.authUsername) {
          const encoded = btoa(`${config.authUsername}:${config.authPassword}`);
          headerMap['Authorization'] = `Basic ${encoded}`;
        }

        // ── Construct proxy payload ──────────────────────────────────────
        const payload: ProxyPayload = {
          url: finalUrl,
          method: config.method,
          headers: headerMap,
        };

        if (methodSupportsBody(config.method) && config.body) {
          payload.body = config.body;
        }

        // ── Call the proxy ───────────────────────────────────────────────
        const res = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        const proxyResponse: ProxyResponse = {
          status: data.status,
          statusText: data.statusText,
          headers: data.headers,
          body: data.body,
          latency: data.latency,
          contentType: data.contentType,
          size: data.size,
        };

        setResponse(proxyResponse);

        // ── Save to history ──────────────────────────────────────────────
        const historyEntry: HistoryEntry = {
          id: generateId(),
          timestamp: Date.now(),
          url: config.url,
          method: config.method,
          headers: config.headers,
          params: config.params,
          body: config.body,
          authType: config.authType,
          authToken: config.authToken,
          authUsername: config.authUsername,
          authPassword: config.authPassword,
          status: proxyResponse.status,
          latency: proxyResponse.latency,
        };

        const updatedHistory = addHistoryEntry(historyEntry);
        setHistory(updatedHistory);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Check the console for details.';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    response,
    error,
    loading,
    history,
    executeRequest,
    setHistory,
    clearResponse,
  };
}
