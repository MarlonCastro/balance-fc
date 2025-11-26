/**
 * Extracts player names from a numbered list format (1. John, 2. Peter, etc.)
 */
export function parseNumberedList(text: string): string[] {
  const lines = text.split('\n');
  const names: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Match patterns like "1. Name", "1) Name", "1 - Name", etc.
    const numberedMatch = trimmed.match(/^\d+[.)\-\s]+(.+)$/);
    if (numberedMatch) {
      const name = cleanName(numberedMatch[1]);
      if (name) {
        names.push(name);
      }
    }
  }

  return names;
}

/**
 * Extracts player names from newline-separated text
 */
export function parseNewlineSeparated(text: string): string[] {
  const lines = text.split('\n');
  const names: string[] = [];

  for (const line of lines) {
    const name = cleanName(line);
    if (name) {
      names.push(name);
    }
  }

  return names;
}

/**
 * Cleans and validates a player name
 */
export function cleanName(name: string): string | null {
  if (!name) return null;

  // Remove leading/trailing whitespace
  let cleaned = name.trim();

  // Remove extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Remove common prefixes/suffixes that might be artifacts
  cleaned = cleaned.replace(/^[-.\s]+|[-.\s]+$/g, '');

  // Validate minimum length (at least 1 character)
  if (cleaned.length < 1) return null;

  // Validate maximum reasonable length (e.g., 50 characters)
  if (cleaned.length > 50) return null;

  return cleaned;
}

/**
 * Parses player names from various input formats
 * Automatically detects and handles different formats
 */
export function parsePlayersNames(input: string): string[] {
  if (!input || !input.trim()) {
    return [];
  }

  const trimmed = input.trim();

  // Try numbered list first (most common format)
  const numberedNames = parseNumberedList(trimmed);
  if (numberedNames.length > 0) {
    return numberedNames;
  }

  // Fall back to newline-separated
  return parseNewlineSeparated(trimmed);
}

/**
 * Validates an array of player names
 */
export function validatePlayerNames(names: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const name of names) {
    const cleaned = cleanName(name);
    if (cleaned) {
      valid.push(cleaned);
    } else {
      invalid.push(name);
    }
  }

  return { valid, invalid };
}

