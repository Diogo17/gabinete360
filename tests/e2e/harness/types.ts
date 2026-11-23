export const TYPES_VERSION = '1.0.0';

export type TestTier = 1 | 2 | 3 | 4;

export interface TestMetadata {
  tier: TestTier;
  featureId?: number;
  scenarioId?: string;
  tags?: string[];
  timeoutMs?: number;
}

export interface TestContext {
  testId: string;
  name: string;
  tier: TestTier;
  featureId?: number;
  log: (...args: any[]) => void;
  workspaceRoot: string;
}

export type TestFn = (ctx: TestContext) => Promise<void> | void;

export interface TestCase {
  id: string;
  name: string;
  tier: TestTier;
  featureId?: number;
  fn: TestFn;
  timeoutMs: number;
}

export interface TestSuite {
  name: string;
  metadata: TestMetadata;
  tests: TestCase[];
  beforeAllFns: Array<() => Promise<void> | void>;
  afterAllFns: Array<() => Promise<void> | void>;
}

export interface AssertionRecord {
  passed: boolean;
  message: string;
  actual?: any;
  expected?: any;
  stack?: string;
}

export interface TestResult {
  id: string;
  name: string;
  tier: TestTier;
  featureId?: number;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  assertionsCount: number;
  error?: Error;
}

export interface TierSummary {
  tier: TestTier;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  assertionsCount: number;
}

export interface SuiteReport {
  timestamp: string;
  durationMs: number;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  totalAssertions: number;
  tiers: Record<`tier${TestTier}`, TierSummary>;
  failures: Array<{
    suiteName: string;
    testName: string;
    tier: TestTier;
    error: string;
    stack?: string;
  }>;
}
