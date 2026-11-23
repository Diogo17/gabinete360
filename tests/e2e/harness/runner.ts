import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import type {
  TestSuite,
  TestCase,
  TestMetadata,
  TestFn,
  TestTier,
  SuiteReport
} from './types.ts';
import { getAssertionCount, resetAssertionCount } from './assertions.ts';

const registry: TestSuite[] = [];
let currentSuite: TestSuite | null = null;

export function describe(
  name: string,
  optionsOrFn: TestMetadata | (() => void),
  maybeFn?: () => void
): void {
  const metadata: TestMetadata = typeof optionsOrFn === 'object' ? optionsOrFn : { tier: 1 };
  const fn = typeof optionsOrFn === 'function' ? optionsOrFn : maybeFn;

  const suite: TestSuite = {
    name,
    metadata,
    tests: [],
    beforeAllFns: [],
    afterAllFns: []
  };

  currentSuite = suite;
  registry.push(suite);

  if (fn) {
    fn();
  }

  currentSuite = null;
}

export function test(name: string, fn: TestFn, timeoutMs = 5000): void {
  if (!currentSuite) {
    throw new Error(`test("${name}") must be called inside a describe() block`);
  }
  const testCase: TestCase = {
    id: `test_${currentSuite.tests.length + 1}`,
    name,
    tier: currentSuite.metadata.tier,
    featureId: currentSuite.metadata.featureId,
    fn,
    timeoutMs
  };
  currentSuite.tests.push(testCase);
}

export function beforeAll(fn: () => Promise<void> | void): void {
  if (currentSuite) {
    currentSuite.beforeAllFns.push(fn);
  }
}

export function afterAll(fn: () => Promise<void> | void): void {
  if (currentSuite) {
    currentSuite.afterAllFns.push(fn);
  }
}

// Discovery and Execution Engine
async function findTestFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await findTestFiles(fullPath)));
    } else if (entry.name.endsWith('.test.ts')) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const options: {
    tier?: TestTier;
    filter?: string;
    scenario?: string;
    bail: boolean;
    json: boolean;
    tap: boolean;
    reportPath?: string;
  } = {
    bail: false,
    json: false,
    tap: false
  };

  for (const arg of args) {
    if (arg.startsWith('--tier=')) {
      options.tier = parseInt(arg.split('=')[1], 10) as TestTier;
    } else if (arg.startsWith('--filter=')) {
      options.filter = arg.split('=')[1];
    } else if (arg.startsWith('--scenario=')) {
      options.scenario = arg.split('=')[1];
    } else if (arg === '--bail') {
      options.bail = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--tap') {
      options.tap = true;
    } else if (arg.startsWith('--report=')) {
      options.reportPath = arg.split('=')[1];
    }
  }
  return options;
}

export async function run(): Promise<void> {
  const startTime = performance.now();
  const options = parseCliArgs();
  const workspaceRoot = process.cwd();
  const testsDir = path.resolve(workspaceRoot, 'tests', 'e2e');

  const files = await findTestFiles(testsDir);
  const filteredFiles = files.filter(f => {
    if (options.tier) {
      if (!f.includes(`tier${options.tier}`)) return false;
    }
    if (options.filter) {
      if (!f.toLowerCase().includes(options.filter.toLowerCase())) return false;
    }
    if (options.scenario) {
      if (!f.toLowerCase().includes(`scenario-${options.scenario}`)) return false;
    }
    return true;
  });

  for (const file of filteredFiles) {
    const fileUrl = pathToFileURL(file).href;
    await import(fileUrl);
  }

  const report: SuiteReport = {
    timestamp: new Date().toISOString(),
    durationMs: 0,
    totalTests: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    totalAssertions: 0,
    tiers: {
      tier1: { tier: 1, total: 0, passed: 0, failed: 0, skipped: 0, assertionsCount: 0 },
      tier2: { tier: 2, total: 0, passed: 0, failed: 0, skipped: 0, assertionsCount: 0 },
      tier3: { tier: 3, total: 0, passed: 0, failed: 0, skipped: 0, assertionsCount: 0 },
      tier4: { tier: 4, total: 0, passed: 0, failed: 0, skipped: 0, assertionsCount: 0 }
    },
    failures: []
  };

  console.log('\x1b[1m\x1b[36m%s\x1b[0m', '================================================================================');
  console.log('\x1b[1m\x1b[32m%s\x1b[0m', '   GABINETE DIGITAL 360° — E2E TEST RUNNER & VERIFICATION SUITE');
  console.log('\x1b[1m\x1b[36m%s\x1b[0m', '================================================================================\n');

  for (const suite of registry) {
    console.log(`\x1b[1m\x1b[34m[Tier ${suite.metadata.tier}] ${suite.name}\x1b[0m`);

    for (const beforeFn of suite.beforeAllFns) {
      await beforeFn();
    }

    for (const t of suite.tests) {
      report.totalTests++;
      const tierKey = `tier${t.tier}` as keyof typeof report.tiers;
      report.tiers[tierKey].total++;

      resetAssertionCount();
      const testStart = performance.now();
      let status: 'passed' | 'failed' = 'passed';
      let failureError: any = null;

      try {
        await t.fn({
          testId: t.id,
          name: t.name,
          tier: t.tier,
          featureId: t.featureId,
          log: console.log,
          workspaceRoot
        });
      } catch (err: any) {
        status = 'failed';
        failureError = err;
      }

      const testDuration = performance.now() - testStart;
      const count = getAssertionCount();
      report.totalAssertions += count;
      report.tiers[tierKey].assertionsCount += count;

      if (status === 'passed') {
        report.passed++;
        report.tiers[tierKey].passed++;
        console.log(`  \x1b[32m✔\x1b[0m ${t.name} \x1b[90m(${Math.round(testDuration)}ms, ${count} asserts)\x1b[0m`);
      } else {
        report.failed++;
        report.tiers[tierKey].failed++;
        console.log(`  \x1b[31m✖\x1b[0m ${t.name}`);
        console.log(`    \x1b[31mError: ${failureError?.message || failureError}\x1b[0m`);
        report.failures.push({
          suiteName: suite.name,
          testName: t.name,
          tier: t.tier,
          error: failureError?.message || String(failureError),
          stack: failureError?.stack
        });
        if (options.bail) {
          console.log('\n\x1b[31mBail triggered. Stopping test run.\x1b[0m');
          break;
        }
      }
    }

    for (const afterFn of suite.afterAllFns) {
      await afterFn();
    }
    console.log('');
    if (options.bail && report.failed > 0) break;
  }

  report.durationMs = Math.round(performance.now() - startTime);

  // Summary Table
  console.log('\x1b[1m\x1b[36m%s\x1b[0m', '--------------------------------------------------------------------------------');
  console.log(`\x1b[1mTier 1 (Feature Happy Paths):     ${report.tiers.tier1.passed}/${report.tiers.tier1.total} passed (${report.tiers.tier1.assertionsCount} asserts)\x1b[0m`);
  console.log(`\x1b[1mTier 2 (Boundary & Negative):     ${report.tiers.tier2.passed}/${report.tiers.tier2.total} passed (${report.tiers.tier2.assertionsCount} asserts)\x1b[0m`);
  console.log(`\x1b[1mTier 3 (Cross-Feature Pairwise):   ${report.tiers.tier3.passed}/${report.tiers.tier3.total} passed (${report.tiers.tier3.assertionsCount} asserts)\x1b[0m`);
  console.log(`\x1b[1mTier 4 (Real-World Scenarios):    ${report.tiers.tier4.passed}/${report.tiers.tier4.total} passed (${report.tiers.tier4.assertionsCount} asserts)\x1b[0m`);
  console.log('\x1b[1m\x1b[36m%s\x1b[0m', '--------------------------------------------------------------------------------');
  console.log(`\x1b[1mTotal Tests:      ${report.totalTests}\x1b[0m`);
  console.log(`\x1b[1mTotal Assertions: ${report.totalAssertions}\x1b[0m`);
  console.log(`\x1b[1mDuration:         ${(report.durationMs / 1000).toFixed(2)}s\x1b[0m`);
  const finalStatus = report.failed === 0 ? '\x1b[32mPASSED (100% contracts verified)\x1b[0m' : `\x1b[31mFAILED (${report.failed} tests failed)\x1b[0m`;
  console.log(`\x1b[1mStatus:           ${finalStatus}\x1b[0m`);
  console.log('\x1b[1m\x1b[36m%s\x1b[0m\n', '================================================================================');

  // Save report
  const reportDest = options.reportPath || path.resolve(workspaceRoot, 'tests', 'reports', 'e2e-summary.json');
  fs.mkdirSync(path.dirname(reportDest), { recursive: true });
  fs.writeFileSync(reportDest, JSON.stringify(report, null, 2), 'utf8');

  if (report.failed > 0) {
    process.exit(1);
  }
}

// Auto-run if executed directly as entrypoint
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch(err => {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
  });
}
