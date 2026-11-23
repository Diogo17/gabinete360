// ============================================================================
// @gabinete360/types - Common Types
// ============================================================================

export type UUID = string;
export type ISODateString = string;

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type SeverityLevel = 'low' | 'normal' | 'high' | 'critical';
export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';
export type Environment = 'development' | 'staging' | 'production' | 'demonstration';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}
