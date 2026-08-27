import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EventRule, SeasonConfig } from './types.js';
import { validateEventRules, validateSeasonConfig } from './validator.js';

/**
 * Convert snake_case YAML keys to camelCase TypeScript keys.
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

/**
 * Recursively convert all keys in an object from snake_case to camelCase.
 */
function convertKeysToCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[toCamelCase(key)] = convertKeysToCamelCase(value);
    }
    return result;
  }
  return obj;
}

/**
 * Parse raw YAML content into event rules (for testing and non-filesystem use).
 */
export function parseEventRules(yamlContent: string): EventRule[] {
  const raw = yaml.load(yamlContent);
  const converted = convertKeysToCamelCase(raw);

  // The YAML may have a top-level { events: [...] } wrapper or be a direct array
  let data: unknown;
  if (
    converted &&
    typeof converted === 'object' &&
    !Array.isArray(converted) &&
    'events' in (converted as Record<string, unknown>)
  ) {
    data = (converted as Record<string, unknown>).events;
  } else {
    data = converted;
  }

  return validateEventRules(data);
}

/**
 * Parse raw YAML content into season configuration (for testing and non-filesystem use).
 */
export function parseSeasonConfig(yamlContent: string): SeasonConfig {
  const raw = yaml.load(yamlContent);
  const converted = convertKeysToCamelCase(raw);
  return validateSeasonConfig(converted);
}

/**
 * Load event rules from a versioned YAML file on disk.
 * Looks for rules-data/{version}/events.yaml relative to the package root.
 */
export function loadEventRules(ruleVersion: string, basePath?: string): EventRule[] {
  const base = basePath ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../rules-data');
  const filePath = path.join(base, ruleVersion, 'events.yaml');
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseEventRules(content);
}

/**
 * Load season configuration from a versioned YAML file on disk.
 * Looks for rules-data/{version}/season-config.yaml relative to the package root.
 */
export function loadSeasonConfig(ruleVersion: string, basePath?: string): SeasonConfig {
  const base = basePath ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../rules-data');
  const filePath = path.join(base, ruleVersion, 'season-config.yaml');
  const content = fs.readFileSync(filePath, 'utf-8');
  return parseSeasonConfig(content);
}
