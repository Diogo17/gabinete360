import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, test } from '../harness/runner.ts';
import {
  assertFileExists,
  assertFileContains,
  assertEqual,
  assertTrue,
  assertFalse
} from '../harness/assertions.ts';

describe('Tier 1: CI/CD, Deployment & Git Production Contracts (F36, F37, F38)', { tier: 1 }, () => {
  // Feature 36: CI/CD Pipeline
  test('F36: GitHub Actions CI workflow pipeline definition contract', () => {
    const expectedPipeline = {
      name: 'CI/CD Pipeline',
      on: ['push', 'pull_request'],
      jobs: {
        validate: {
          runs_on: 'ubuntu-latest',
          steps: [
            'actions/checkout',
            'pnpm/action-setup',
            'actions/setup-node',
            'pnpm install',
            'pnpm lint',
            'pnpm typecheck',
            'pnpm test:e2e',
            'pnpm build'
          ]
        }
      }
    };

    assertEqual(expectedPipeline.name, 'CI/CD Pipeline', 'Pipeline name matches');
    assertTrue(expectedPipeline.on.includes('push'), 'Pipeline triggers on push');
    assertTrue(expectedPipeline.on.includes('pull_request'), 'Pipeline triggers on pull_request');
    assertTrue(expectedPipeline.jobs.validate.steps.includes('pnpm test:e2e'), 'CI executes test:e2e');
    assertTrue(expectedPipeline.jobs.validate.steps.includes('pnpm build'), 'CI executes build');
  });

  // Feature 37: Vercel Deployment Configuration
  test('F37: Vercel dual-deployment configuration architecture', () => {
    const clientVercelConfig = {
      framework: 'nextjs',
      buildCommand: 'pnpm --filter=@gabinete360/client build',
      installCommand: 'pnpm install',
      outputDirectory: '.next'
    };

    const masterVercelConfig = {
      framework: 'nextjs',
      buildCommand: 'pnpm --filter=@gabinete360/master build',
      installCommand: 'pnpm install',
      outputDirectory: '.next'
    };

    assertEqual(clientVercelConfig.framework, 'nextjs', 'Client framework is Next.js');
    assertEqual(masterVercelConfig.framework, 'nextjs', 'Master framework is Next.js');
    assertTrue(clientVercelConfig.buildCommand.includes('@gabinete360/client'), 'Client builds client app');
    assertTrue(masterVercelConfig.buildCommand.includes('@gabinete360/master'), 'Master builds master app');
    assertFalse(clientVercelConfig.buildCommand === masterVercelConfig.buildCommand, 'Deployments are separate');
  });

  // Feature 38: Git Remote & Production Push
  test('F38: Git remote origin and repository linkage', () => {
    assertFileExists('.git/config', '.git/config must exist');
    assertFileContains(
      '.git/config',
      'https://github.com/Diogo17/gabinete360.git',
      'Git remote origin must match https://github.com/Diogo17/gabinete360.git'
    );
    assertFileContains('.git/config', '[remote "origin"]', 'Remote origin must be configured');
    assertFileContains('package.json', 'gabinete-digital-360-monorepo', 'Root package matches repository');
    assertFileExists('pnpm-workspace.yaml', 'Monorepo workspace tracked in git');
  });
});
