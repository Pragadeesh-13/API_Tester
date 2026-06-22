import type { EnvVariable } from './types';

/**
 * Interpolates environment variables in the format {{variableName}}
 * within a given string. Replaces all occurrences with their values.
 */
export function interpolateEnvVars(input: string, envVars: EnvVariable[]): string {
  if (!input || envVars.length === 0) return input;

  let result = input;
  for (const envVar of envVars) {
    if (envVar.key && envVar.value) {
      const pattern = new RegExp(`\\{\\{\\s*${escapeRegex(envVar.key)}\\s*\\}\\}`, 'g');
      result = result.replace(pattern, envVar.value);
    }
  }
  return result;
}

/**
 * Escapes special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a string contains any {{variable}} patterns.
 */
export function hasEnvVarSyntax(input: string): boolean {
  return /\{\{.+?\}\}/.test(input);
}

/**
 * Extracts all variable names used in {{variable}} patterns.
 */
export function extractEnvVarNames(input: string): string[] {
  const matches = input.matchAll(/\{\{\s*(.+?)\s*\}\}/g);
  return [...matches].map((m) => m[1]);
}
