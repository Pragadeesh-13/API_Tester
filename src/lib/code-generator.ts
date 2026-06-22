import type { HttpMethod, KeyValuePair } from './types';

// ─── JavaScript fetch() Snippet ──────────────────────────────────────────────

export function generateFetchSnippet(
  url: string,
  method: HttpMethod,
  headers: KeyValuePair[],
  body: string
): string {
  const activeHeaders = headers.filter((h) => h.enabled && h.key);
  const hasBody = body && method !== 'GET';

  let code = `const response = await fetch('${url}'`;

  const options: string[] = [];
  options.push(`  method: '${method}'`);

  if (activeHeaders.length > 0) {
    const headerLines = activeHeaders
      .map((h) => `    '${h.key}': '${h.value}'`)
      .join(',\n');
    options.push(`  headers: {\n${headerLines}\n  }`);
  }

  if (hasBody) {
    // Try to detect if body is JSON
    try {
      JSON.parse(body);
      options.push(`  body: JSON.stringify(${body})`);
    } catch {
      options.push(`  body: ${JSON.stringify(body)}`);
    }
  }

  if (options.length > 0) {
    code += `, {\n${options.join(',\n')}\n}`;
  }

  code += ');\n\nconst data = await response.json();\nconsole.log(data);';

  return code;
}

// ─── cURL Command Snippet ────────────────────────────────────────────────────

export function generateCurlSnippet(
  url: string,
  method: HttpMethod,
  headers: KeyValuePair[],
  body: string
): string {
  const activeHeaders = headers.filter((h) => h.enabled && h.key);
  const hasBody = body && method !== 'GET';

  const parts: string[] = ['curl'];

  if (method !== 'GET') {
    parts.push(`-X ${method}`);
  }

  parts.push(`'${url}'`);

  for (const header of activeHeaders) {
    parts.push(`-H '${header.key}: ${header.value}'`);
  }

  if (hasBody) {
    parts.push(`-d '${body.replace(/'/g, "'\\''")}'`);
  }

  return parts.join(' \\\n  ');
}
