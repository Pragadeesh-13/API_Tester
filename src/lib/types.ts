// ─── Request Configuration ───────────────────────────────────────────────────

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type AuthType = 'none' | 'bearer' | 'basic';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
  authType: AuthType;
  authToken: string;
  authUsername: string;
  authPassword: string;
}

// ─── Proxy Communication ─────────────────────────────────────────────────────

export interface ProxyPayload {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
}

export interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: unknown;
  latency: number;
  contentType: string;
  size: number;
}

export interface ProxyErrorResponse {
  error: string;
  latency: number;
}

// ─── History & Environment ───────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  timestamp: number;
  url: string;
  method: HttpMethod;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
  authType: AuthType;
  authToken: string;
  authUsername: string;
  authPassword: string;
  status?: number;
  latency?: number;
}

export interface EnvVariable {
  id: string;
  key: string;
  value: string;
}

// ─── UI State ────────────────────────────────────────────────────────────────

export type RequestTab = 'params' | 'headers' | 'auth' | 'body';
export type ResponseTab = 'pretty' | 'preview' | 'headers' | 'codegen';
