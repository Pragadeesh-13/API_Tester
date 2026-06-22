import { NextResponse } from 'next/server';

interface ProxyRequestPayload {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}

const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']);

export async function POST(request: Request) {
  const startTime = performance.now();

  try {
    // ── Parse incoming payload ───────────────────────────────────────────
    let payload: ProxyRequestPayload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload. Expected: { url, method, headers?, body? }', latency: 0 },
        { status: 400 }
      );
    }

    const { url, method, headers: reqHeaders, body } = payload;

    // ── Validate inputs ──────────────────────────────────────────────────
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "url" field.', latency: 0 },
        { status: 400 }
      );
    }

    const upperMethod = (method || 'GET').toUpperCase();
    if (!ALLOWED_METHODS.has(upperMethod)) {
      return NextResponse.json(
        { error: `Unsupported HTTP method: "${method}". Allowed: ${[...ALLOWED_METHODS].join(', ')}`, latency: 0 },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: `Invalid URL format: "${url}". Must be a fully qualified URL (e.g. https://api.example.com/path).`, latency: 0 },
        { status: 400 }
      );
    }

    // ── Build fetch options ──────────────────────────────────────────────
    const fetchOptions: RequestInit = {
      method: upperMethod,
      headers: reqHeaders || {},
      redirect: 'follow',
    };

    // Attach body for non-GET/HEAD methods
    if (body && upperMethod !== 'GET' && upperMethod !== 'HEAD') {
      fetchOptions.body = body;
    }

    // ── Execute server-side fetch ────────────────────────────────────────
    const fetchStart = performance.now();
    const response = await fetch(url, fetchOptions);
    const rawBody = await response.text();
    const fetchEnd = performance.now();

    const latency = Math.round((fetchEnd - fetchStart) * 100) / 100;

    // ── Extract response headers ─────────────────────────────────────────
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // ── Parse response body based on content type ────────────────────────
    const contentType = response.headers.get('content-type') || '';
    let parsedBody: unknown = rawBody;

    if (contentType.includes('application/json') || contentType.includes('+json')) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        // If JSON parsing fails, keep it as raw text
        parsedBody = rawBody;
      }
    }

    // ── Compute approximate response size ────────────────────────────────
    const size = new TextEncoder().encode(rawBody).length;

    // ── Return structured response ───────────────────────────────────────
    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: parsedBody,
      latency,
      contentType,
      size,
    });
  } catch (error: unknown) {
    const endTime = performance.now();
    const latency = Math.round((endTime - startTime) * 100) / 100;

    // ── Handle all error scenarios ───────────────────────────────────────
    let errorMessage = 'An unexpected error occurred during the proxy request.';

    if (error instanceof TypeError) {
      // Network errors, DNS failures, connection refused
      if (error.message.includes('fetch failed')) {
        errorMessage = 'Network error: Unable to reach the target server. Check the URL and ensure the server is accessible.';
      } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
        errorMessage = 'DNS resolution failed: The hostname could not be resolved. Verify the domain name is correct.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused: The target server actively refused the connection.';
      } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        errorMessage = 'Request timed out: The target server did not respond in time.';
      } else {
        errorMessage = `Network error: ${error.message}`;
      }
    } else if (error instanceof Error) {
      errorMessage = `Proxy execution error: ${error.message}`;
    }

    return NextResponse.json(
      { error: errorMessage, latency },
      { status: 502 }
    );
  }
}
