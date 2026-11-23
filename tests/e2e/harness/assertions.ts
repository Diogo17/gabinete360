import * as fs from 'node:fs';
import * as path from 'node:path';

let assertionCount = 0;

export function recordAssertion(): void {
  assertionCount++;
}

export function getAssertionCount(): number {
  return assertionCount;
}

export function resetAssertionCount(): void {
  assertionCount = 0;
}

export class AssertionError extends Error {
  actual: any;
  expected: any;
  details?: string;

  constructor(message: string, actual?: any, expected?: any, details?: string) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
    this.details = details;
  }
}

// 1. Filesystem & Architecture Assertions
export function assertFileExists(relPath: string, description?: string): void {
  recordAssertion();
  const fullPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    throw new AssertionError(
      description || `File does not exist: ${relPath}`,
      false,
      true,
      `Checked path: ${fullPath}`
    );
  }
}

export function assertDirectoryExists(relPath: string, description?: string): void {
  recordAssertion();
  const fullPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isDirectory()) {
    throw new AssertionError(
      description || `Directory does not exist: ${relPath}`,
      false,
      true,
      `Checked path: ${fullPath}`
    );
  }
}

export function assertFileContains(relPath: string, pattern: string | RegExp, description?: string): void {
  recordAssertion();
  assertFileExists(relPath);
  const fullPath = path.resolve(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const matched = typeof pattern === 'string' ? content.includes(pattern) : pattern.test(content);
  if (!matched) {
    throw new AssertionError(
      description || `File ${relPath} does not contain pattern: ${pattern}`,
      content.slice(0, 100) + '...',
      pattern.toString(),
      `Pattern not found in ${relPath}`
    );
  }
}

export function assertFileNotContains(relPath: string, pattern: string | RegExp, description?: string): void {
  recordAssertion();
  assertFileExists(relPath);
  const fullPath = path.resolve(process.cwd(), relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const matched = typeof pattern === 'string' ? content.includes(pattern) : pattern.test(content);
  if (matched) {
    throw new AssertionError(
      description || `File ${relPath} contains forbidden pattern: ${pattern}`,
      pattern.toString(),
      'Pattern must NOT be present',
      `Forbidden match in ${relPath}`
    );
  }
}

export function assertJsonStructure<T = any>(
  target: string | Record<string, any>,
  validator: (obj: any) => boolean,
  description?: string
): void {
  recordAssertion();
  let parsed: any;
  if (typeof target === 'string') {
    assertFileExists(target);
    const content = fs.readFileSync(path.resolve(process.cwd(), target), 'utf8');
    parsed = JSON.parse(content);
  } else {
    parsed = target;
  }
  if (!validator(parsed)) {
    throw new AssertionError(
      description || 'JSON structure does not satisfy schema validator',
      parsed,
      'Valid schema matching'
    );
  }
}

// 2. Security & Policy Assertions
export function assertNoSecretsExposed(relPathOrContent: string, description?: string): void {
  recordAssertion();
  let content = relPathOrContent;
  const fullPath = path.resolve(process.cwd(), relPathOrContent);
  if (fs.existsSync(fullPath)) {
    content = fs.readFileSync(fullPath, 'utf8');
  }
  const forbiddenPatterns = [
    /NEXT_PUBLIC_[A-Z0-9_]*(?:SERVICE_ROLE|SECRET|PRIVATE)/i,
    /(?:SERVICE_ROLE_KEY|JWT_SECRET|PRIVATE_KEY)\s*=\s*['"]?[a-zA-Z0-9_\-\.]{15,}['"]?/i,
    /eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}/ // JWT secret pattern
  ];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) {
      throw new AssertionError(
        description || 'Forbidden secret pattern found in code or config',
        'SECRET_EXPOSED',
        'NO_SECRETS'
      );
    }
  }
}

export function assertDemoWatermark(contentOrHtml: string, description?: string): void {
  recordAssertion();
  if (!contentOrHtml.includes('DEMONSTRAÇÃO')) {
    throw new AssertionError(
      description || 'Mandatory "DEMONSTRAÇÃO" badge or watermark missing',
      contentOrHtml.slice(0, 100),
      'DEMONSTRAÇÃO'
    );
  }
}

export function assertColorToken(cssContent: string, varName: string, expectedHex: string, description?: string): void {
  recordAssertion();
  const regex = new RegExp(`${varName}\\s*:\\s*${expectedHex}`, 'i');
  if (!regex.test(cssContent)) {
    throw new AssertionError(
      description || `Design token ${varName} does not match expected color ${expectedHex}`,
      cssContent.slice(0, 200),
      `${varName}: ${expectedHex}`
    );
  }
}

// 3. Core Logic & Primitive Assertions
export function assertEqual<T>(actual: T, expected: T, description?: string): void {
  recordAssertion();
  if (actual !== expected) {
    throw new AssertionError(
      description || `Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`,
      actual,
      expected
    );
  }
}

export function assertNotEqual<T>(actual: T, notExpected: T, description?: string): void {
  recordAssertion();
  if (actual === notExpected) {
    throw new AssertionError(
      description || `Expected ${JSON.stringify(actual)} to not equal ${JSON.stringify(notExpected)}`,
      actual,
      notExpected
    );
  }
}

export function assertTrue(value: boolean, description?: string): void {
  recordAssertion();
  if (value !== true) {
    throw new AssertionError(description || 'Expected value to be true', value, true);
  }
}

export function assertFalse(value: boolean, description?: string): void {
  recordAssertion();
  if (value !== false) {
    throw new AssertionError(description || 'Expected value to be false', value, false);
  }
}

export function assertThrows(fn: () => any, expectedErrorSnippet?: string, description?: string): void {
  recordAssertion();
  let threw = false;
  try {
    fn();
  } catch (err: any) {
    threw = true;
    if (expectedErrorSnippet && !String(err.message || err).includes(expectedErrorSnippet)) {
      throw new AssertionError(
        description || `Threw error but did not match snippet: ${expectedErrorSnippet}`,
        err.message,
        expectedErrorSnippet
      );
    }
  }
  if (!threw) {
    throw new AssertionError(description || 'Expected function to throw an error, but it succeeded', null, 'Error');
  }
}

export async function assertThrowsAsync(fn: () => Promise<any>, expectedErrorSnippet?: string, description?: string): Promise<void> {
  recordAssertion();
  let threw = false;
  try {
    await fn();
  } catch (err: any) {
    threw = true;
    if (expectedErrorSnippet && !String(err.message || err).includes(expectedErrorSnippet)) {
      throw new AssertionError(
        description || `Threw error but did not match snippet: ${expectedErrorSnippet}`,
        err.message,
        expectedErrorSnippet
      );
    }
  }
  if (!threw) {
    throw new AssertionError(description || 'Expected async function to throw an error, but it succeeded', null, 'Error');
  }
}

export function assertMatches(value: string, regex: RegExp, description?: string): void {
  recordAssertion();
  if (!regex.test(value)) {
    throw new AssertionError(
      description || `Value "${value}" does not match regex ${regex}`,
      value,
      regex.toString()
    );
  }
}

export function assertGreaterThan(actual: number, min: number, description?: string): void {
  recordAssertion();
  if (actual <= min) {
    throw new AssertionError(
      description || `Expected ${actual} to be greater than ${min}`,
      actual,
      `> ${min}`
    );
  }
}

export function assertLessThanOrEqual(actual: number, max: number, description?: string): void {
  recordAssertion();
  if (actual > max) {
    throw new AssertionError(
      description || `Expected ${actual} to be less than or equal to ${max}`,
      actual,
      `<= ${max}`
    );
  }
}

export function assertIncludes(arrayOrStr: string | any[], item: any, description?: string): void {
  recordAssertion();
  if (!arrayOrStr.includes(item)) {
    throw new AssertionError(
      description || `Expected collection to include ${JSON.stringify(item)}`,
      arrayOrStr,
      item
    );
  }
}

export function assertHttpStatus(actualStatus: number, expectedStatus: number, description?: string): void {
  recordAssertion();
  if (actualStatus !== expectedStatus) {
    throw new AssertionError(
      description || `HTTP status expected ${expectedStatus}, received ${actualStatus}`,
      actualStatus,
      expectedStatus
    );
  }
}
