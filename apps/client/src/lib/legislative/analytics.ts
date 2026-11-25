export interface DocumentMetricInput {
  id: string;
  documentType: string;
  status: string;
  createdAt: string;
  signedAt?: string;
  redFlagCodes?: string[];
}

export interface DocumentAnalyticsSummary {
  totalDocuments: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  pendingReviewCount: number;
  signedCount: number;
  topRedFlags: Array<{ code: string; count: number }>;
}

/**
 * Aggregates operational document metrics without personal ranking (Section 24.11).
 */
export function computeDocumentAnalytics(items: DocumentMetricInput[]): DocumentAnalyticsSummary {
  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const redFlagCounts: Record<string, number> = {};

  let pendingReviewCount = 0;
  let signedCount = 0;

  for (const item of items) {
    byType[item.documentType] = (byType[item.documentType] ?? 0) + 1;
    byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;

    if (item.status === 'needs_review' || item.status === 'draft') {
      pendingReviewCount++;
    }
    if (item.status === 'signed' || item.status === 'signed_completed') {
      signedCount++;
    }

    for (const code of item.redFlagCodes ?? []) {
      redFlagCounts[code] = (redFlagCounts[code] ?? 0) + 1;
    }
  }

  const topRedFlags = Object.entries(redFlagCounts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalDocuments: items.length,
    byType,
    byStatus,
    pendingReviewCount,
    signedCount,
    topRedFlags,
  };
}
