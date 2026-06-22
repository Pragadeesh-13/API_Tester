import type { HistoryEntry, EnvVariable } from './types';

const HISTORY_KEY = 'apexclient-ultra-history';
const ENV_KEY = 'apexclient-ultra-env';
const MAX_HISTORY = 50;

// ─── History ─────────────────────────────────────────────────────────────────

export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = entries.slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // Silently fail if storage is full
  }
}

export function addHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const history = loadHistory();
  const updated = [entry, ...history].slice(0, MAX_HISTORY);
  saveHistory(updated);
  return updated;
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(HISTORY_KEY);
}

// ─── Environment Variables ───────────────────────────────────────────────────

export function loadEnvVars(): EnvVariable[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ENV_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveEnvVars(envVars: EnvVariable[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ENV_KEY, JSON.stringify(envVars));
  } catch {
    // Silently fail if storage is full
  }
}
