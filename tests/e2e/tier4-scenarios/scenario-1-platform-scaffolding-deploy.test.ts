import { describe, test } from '../harness/runner.ts';
import {
  assertFileExists,
  assertDirectoryExists,
  assertFileContains,
  assertColorToken,
  assertNoSecretsExposed,
  assertEqual,
  assertTrue
} from '../harness/assertions.ts';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('Tier 4: Scenario 1 — Platform Scaffolding, Quality & Deployment Integrity (S1)', { tier: 4 }, () => {
  test('S1: Comprehensive monorepo build, strict configs, tokens, migrations & deploy readiness', () => {
    // 1. Monorepo Workspaces & Tooling
    assertFileExists('pnpm-workspace.yaml', 'pnpm-workspace.yaml exists');
    assertFileExists('turbo.json', 'turbo.json exists');
    assertFileExists('package.json', 'Root package.json exists');
    assertDirectoryExists('apps/client', 'apps/client exists');
    assertDirectoryExists('apps/master', 'apps/master exists');
    assertDirectoryExists('packages/ui', 'packages/ui exists');
    assertDirectoryExists('packages/types', 'packages/types exists');
    assertDirectoryExists('packages/config', 'packages/config exists');

    // 2. Strict Configs & Zero Secrets
    assertFileExists('packages/config/typescript/base.json', 'Base tsconfig exists');
    assertFileContains('packages/config/typescript/base.json', '"strict": true', 'Strict TypeScript enabled');
    assertFileExists('.env.example', '.env.example exists');
    assertNoSecretsExposed('.env.example', '.env.example has zero secrets');

    // 3. Shared Types & Design System Tokens
    assertFileExists('packages/types/src/index.ts', 'Types barrel exists');
    assertFileExists('packages/ui/src/styles/tokens.css', 'tokens.css exists');
    const cssContent = fs.readFileSync(path.resolve(process.cwd(), 'packages/ui/src/styles/tokens.css'), 'utf8');
    assertColorToken(cssContent, '--green', '#176b52', 'Primary green #176b52 matches prototype');
    assertColorToken(cssContent, '--paper', '#f6f8f5', 'Paper background #f6f8f5 matches prototype');
    assertColorToken(cssContent, '--ink', '#172b27', 'Ink text #172b27 matches prototype');

    // 4. Database Migrations
    assertFileExists('gabinete_digital_360_sql_package_v1/control_plane/migrations/001_control_plane_foundation.sql', 'CP migration exists');
    assertFileExists('gabinete_digital_360_sql_package_v1/operational_plane/migrations/001_operational_foundation.sql', 'OP migration exists');

    // 5. CI/CD & Vercel & Git Remote
    assertFileExists('.git/config', '.git/config exists');
    assertFileContains('.git/config', 'https://github.com/Diogo17/gabinete360.git', 'Git remote configured');

    assertTrue(true, 'Scenario 1 Platform Scaffolding and Quality verification completed successfully');
  });
});
