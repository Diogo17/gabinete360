import { describe, test } from '../harness/runner.ts';
import {
  assertFileExists,
  assertDirectoryExists,
  assertFileContains,
  assertJsonStructure,
  assertNoSecretsExposed,
  assertTrue,
  assertEqual
} from '../harness/assertions.ts';

describe('Tier 1: Scaffolding, Tooling & Core Types (F1, F2, F3)', { tier: 1 }, () => {
  // Feature 1: Monorepo Scaffolding & Workspaces
  test('F1.1: Root workspace configuration and package layout', () => {
    assertFileExists('pnpm-workspace.yaml', 'pnpm-workspace.yaml must exist');
    assertFileContains('pnpm-workspace.yaml', 'apps/*', 'Workspaces must include apps/*');
    assertFileContains('pnpm-workspace.yaml', 'packages/*', 'Workspaces must include packages/*');
    assertDirectoryExists('apps', 'apps/ directory must exist');
    assertDirectoryExists('packages', 'packages/ directory must exist');
  });

  test('F1.2: Turborepo pipeline configuration and root scripts', () => {
    assertFileExists('turbo.json', 'turbo.json must exist');
    assertJsonStructure('turbo.json', (json) => {
      return json && json.tasks && (json.tasks.build || json.pipeline?.build);
    }, 'turbo.json must define build task pipeline');
    assertFileExists('package.json', 'Root package.json must exist');
    assertJsonStructure('package.json', (pkg) => {
      return pkg.scripts && pkg.scripts.build && pkg.scripts['test:e2e'];
    }, 'package.json must contain build and test:e2e scripts');
    assertFileContains('package.json', 'test:e2e', 'test:e2e must be declared in package.json');
  });

  test('F1.3: Git ignore rules and environment cleanliness', () => {
    assertFileExists('.gitignore', '.gitignore must exist');
    assertFileContains('.gitignore', 'node_modules', '.gitignore must ignore node_modules');
    assertFileContains('.gitignore', '.turbo', '.gitignore must ignore .turbo');
    assertFileContains('.gitignore', '.next', '.gitignore must ignore .next');
    assertFileContains('.gitignore', '.env', '.gitignore must ignore .env files');
  });

  // Feature 2: Tooling & Strict Configs
  test('F2.1: Tooling configuration packages and strict TypeScript base', () => {
    assertDirectoryExists('packages/config', 'packages/config must exist');
    assertFileExists('packages/config/typescript/base.json', 'TypeScript base config must exist');
    assertJsonStructure('packages/config/typescript/base.json', (cfg) => {
      return cfg.compilerOptions && cfg.compilerOptions.strict === true;
    }, 'compilerOptions.strict must be true in base.json');
    assertFileExists('packages/config/eslint/base.js', 'ESLint base configuration must exist');
    assertFileExists('packages/config/tailwind/tailwind.config.ts', 'Tailwind shared config must exist');
  });

  test('F2.2: Environment variable templates and zero secret leakage', () => {
    assertFileExists('.env.example', '.env.example must exist');
    assertFileContains('.env.example', 'NEXT_PUBLIC_SUPABASE_URL', '.env.example must define NEXT_PUBLIC_SUPABASE_URL');
    assertFileContains('.env.example', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '.env.example must define publishable key');
    assertNoSecretsExposed('.env.example', '.env.example must not contain secret tokens or passwords');
    assertNoSecretsExposed('package.json', 'package.json must not expose secret tokens');
  });

  // Feature 3: Core Shared Types
  test('F3.1: Shared types package exports barrel and package metadata', () => {
    assertDirectoryExists('packages/types', 'packages/types must exist');
    assertFileExists('packages/types/package.json', 'packages/types/package.json must exist');
    assertJsonStructure('packages/types/package.json', (pkg) => {
      return pkg.name === '@gabinete360/types';
    }, 'Package name must be @gabinete360/types');
    assertFileExists('packages/types/src/index.ts', 'packages/types/src/index.ts barrel must exist');
    assertFileContains('packages/types/src/index.ts', "export * from './common'", 'Barrel must export common types');
  });

  test('F3.2: Control Plane and Operational Plane domain model types', () => {
    assertFileExists('packages/types/src/control-plane.ts', 'control-plane.ts must exist');
    assertFileContains('packages/types/src/control-plane.ts', 'PlatformTenant', 'control-plane.ts must export PlatformTenant');
    assertFileContains('packages/types/src/control-plane.ts', 'PlatformAdmin', 'control-plane.ts must export PlatformAdmin');
    assertFileExists('packages/types/src/operational-plane.ts', 'operational-plane.ts must exist');
    assertFileContains('packages/types/src/operational-plane.ts', 'Citizen', 'operational-plane.ts must export Citizen');
  });
});
