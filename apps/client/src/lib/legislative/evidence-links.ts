export type EvidenceSourceType =
  | 'photo'
  | 'video'
  | 'protocol'
  | 'meeting'
  | 'inspection'
  | 'official_news'
  | 'public_data'
  | 'previous_office';

export interface DocumentEvidenceLink {
  id: string;
  claimSummary: string;
  sourceType: EvidenceSourceType;
  sourceReference: string;
  sourceUrl?: string;
  capturedAt: string;
}

/**
 * Validates and indexes factual evidence links for a document (Section 24.7).
 */
export function summarizeEvidenceLinks(links: DocumentEvidenceLink[]): {
  totalLinks: number;
  byType: Record<string, number>;
  hasUnreferencedClaims: boolean;
} {
  const byType: Record<string, number> = {};
  let hasUnreferencedClaims = false;

  for (const link of links) {
    byType[link.sourceType] = (byType[link.sourceType] ?? 0) + 1;
    if (!link.sourceReference.trim()) {
      hasUnreferencedClaims = true;
    }
  }

  return {
    totalLinks: links.length,
    byType,
    hasUnreferencedClaims,
  };
}
