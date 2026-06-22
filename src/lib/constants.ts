import type { HttpMethod } from './types';

// ─── HTTP Method Definitions ─────────────────────────────────────────────────

export const HTTP_METHODS: {
  value: HttpMethod;
  label: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  { value: 'GET', label: 'GET', color: 'text-emerald-700', bg: 'bg-emerald-600', border: 'border-emerald-700' },
  { value: 'POST', label: 'POST', color: 'text-blue-700', bg: 'bg-blue-600', border: 'border-blue-700' },
  { value: 'PUT', label: 'PUT', color: 'text-amber-700', bg: 'bg-amber-600', border: 'border-amber-700' },
  { value: 'DELETE', label: 'DELETE', color: 'text-red-700', bg: 'bg-red-600', border: 'border-red-700' },
  { value: 'PATCH', label: 'PATCH', color: 'text-purple-700', bg: 'bg-purple-600', border: 'border-purple-700' },
];

export function getMethodConfig(method: HttpMethod) {
  return HTTP_METHODS.find((m) => m.value === method) ?? HTTP_METHODS[0];
}

// ─── Status Code Styling ─────────────────────────────────────────────────────

export function getStatusColor(status: number): { text: string; bg: string; border: string } {
  if (status >= 200 && status < 300) {
    return { text: 'text-emerald-700', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' };
  }
  if (status >= 300 && status < 400) {
    return { text: 'text-blue-700', bg: 'bg-blue-500/20', border: 'border-blue-500/40' };
  }
  if (status >= 400 && status < 500) {
    return { text: 'text-amber-700', bg: 'bg-amber-500/20', border: 'border-amber-500/40' };
  }
  if (status >= 500) {
    return { text: 'text-red-700', bg: 'bg-red-500/20', border: 'border-red-500/40' };
  }
  return { text: 'text-slate-700', bg: 'bg-slate-500/20', border: 'border-slate-500/40' };
}

// ─── Methods With Body ───────────────────────────────────────────────────────

export const METHODS_WITH_BODY: HttpMethod[] = ['POST', 'PUT', 'DELETE', 'PATCH'];

export function methodSupportsBody(method: HttpMethod): boolean {
  return METHODS_WITH_BODY.includes(method);
}

// ─── ID Generator ────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
