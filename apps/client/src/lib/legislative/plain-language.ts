export interface JargonFinding {
  term: string;
  suggestion: string;
}

const LEGAL_JARGON_MAP: Record<string, string> = {
  'outrossim': 'além disso',
  'destarte': 'assim / dessa forma',
  'ex vi': 'conforme / de acordo com',
  'data venia': 'com o devido respeito',
  'in limine': 'desde o início',
  'ipso facto': 'por esse mesmo fato',
  'mormente': 'especialmente',
  'consectário': 'consequência',
};

/**
 * Detects excessive legal jargon and suggests plain-language equivalents (Section 24.10).
 * Does not alter facts or legal content automatically.
 */
export function detectLegalJargon(text: string): JargonFinding[] {
  const findings: JargonFinding[] = [];
  const lower = text.toLowerCase();

  for (const [term, suggestion] of Object.entries(LEGAL_JARGON_MAP)) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(lower)) {
      findings.push({ term, suggestion });
    }
  }

  return findings;
}
