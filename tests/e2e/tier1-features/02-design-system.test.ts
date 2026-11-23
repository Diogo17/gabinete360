import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, test } from '../harness/runner.ts';
import {
  assertFileExists,
  assertFileContains,
  assertColorToken,
  assertDemoWatermark,
  assertTrue
} from '../harness/assertions.ts';

describe('Tier 1: Design System, Tokens, Components & Shells (F4, F5, F6)', { tier: 1 }, () => {
  // Feature 4: Design System Tokens & Base CSS
  test('F4.1: CSS custom property tokens and prototype color palette', () => {
    assertFileExists('packages/ui/src/styles/tokens.css', 'tokens.css must exist');
    const cssContent = fs.readFileSync(path.resolve(process.cwd(), 'packages/ui/src/styles/tokens.css'), 'utf8');

    assertColorToken(cssContent, '--green', '#176b52', 'Primary green token must match #176b52');
    assertColorToken(cssContent, '--ink', '#172b27', 'Text ink token must match #172b27');
    assertColorToken(cssContent, '--paper', '#f6f8f5', 'Background paper token must match #f6f8f5');
    assertColorToken(cssContent, '--mint', '#e8f3ed', 'Mint badge token must match #e8f3ed');
    assertColorToken(cssContent, '--gold', '#c78c38', 'Gold attention token must match #c78c38');
    assertColorToken(cssContent, '--red', '#bb5d51', 'Red error/urgency token must match #bb5d51');
    assertColorToken(cssContent, '--blue', '#557a98', 'Blue info token must match #557a98');
  });

  test('F4.2: Typography tokens for Manrope headings and DM Sans body', () => {
    assertFileContains('packages/ui/src/styles/tokens.css', 'Manrope', 'CSS must import and define Manrope font');
    assertFileContains('packages/ui/src/styles/tokens.css', 'DM Sans', 'CSS must import and define DM Sans font');
    assertFileContains('packages/ui/src/styles/tokens.css', '--font-manrope', 'CSS variable --font-manrope must exist');
    assertFileContains('packages/ui/src/styles/tokens.css', '--font-dm-sans', 'CSS variable --font-dm-sans must exist');
    assertFileContains('packages/ui/src/styles/tokens.css', 'font-family: var(--font-dm-sans)', 'Body must use DM Sans');
  });

  // Feature 5: Reusable Base Components
  test('F5.1: Core UI primitives exported from packages/ui', () => {
    assertFileExists('packages/ui/src/components/button.tsx', 'Button component must exist');
    assertFileExists('packages/ui/src/components/card.tsx', 'Card component must exist');
    assertFileExists('packages/ui/src/components/stat-card.tsx', 'StatCard component must exist');
    assertFileExists('packages/ui/src/components/badge.tsx', 'Badge component must exist');
    assertFileExists('packages/ui/src/components/demo-watermark.tsx', 'DemoWatermark component must exist');
    assertFileExists('packages/ui/src/components/modal.tsx', 'Modal component must exist');
    assertFileExists('packages/ui/src/components/table.tsx', 'Table component must exist');
  });

  test('F5.2: Demo watermark component enforces mandatory DEMONSTRAÇÃO label', () => {
    const watermarkContent = fs.readFileSync(
      path.resolve(process.cwd(), 'packages/ui/src/components/demo-watermark.tsx'),
      'utf8'
    );
    assertDemoWatermark(watermarkContent, 'DemoWatermark component must include DEMONSTRAÇÃO text');
    assertFileContains('packages/ui/src/components/demo-watermark.tsx', 'export', 'Component must be exported');
    assertFileContains('packages/ui/src/components/stat-card.tsx', 'export', 'StatCard component must be exported');
    assertFileContains('packages/ui/src/components/badge.tsx', 'export', 'Badge component must be exported');
    assertFileContains('packages/ui/src/components/table.tsx', 'export', 'Table component must be exported');
  });

  // Feature 6: Navigation Shells & States
  test('F6.1: Application layout shells for Client and Master portals', () => {
    assertFileExists('packages/ui/src/components/app-shell/app-shell.tsx', 'AppShell component must exist');
    assertFileExists('packages/ui/src/components/app-shell/sidebar.tsx', 'Sidebar component must exist');
    assertFileExists('packages/ui/src/components/app-shell/topbar.tsx', 'Topbar component must exist');
    assertFileExists('packages/ui/src/components/app-shell/mobile-nav.tsx', 'MobileNav component must exist');
    assertFileContains('packages/ui/src/components/app-shell/sidebar.tsx', 'groups', 'Sidebar must accept groups prop');
  });

  test('F6.2: Complete feedback states (Skeleton, Empty, Error, Forbidden)', () => {
    assertFileExists('packages/ui/src/components/states/skeleton-loader.tsx', 'SkeletonLoader component must exist');
    assertFileExists('packages/ui/src/components/states/empty-state.tsx', 'EmptyState component must exist');
    assertFileExists('packages/ui/src/components/states/error-state.tsx', 'ErrorState component must exist');
    assertFileExists('packages/ui/src/components/states/forbidden-state.tsx', 'ForbiddenState component must exist');
    assertFileContains('packages/ui/src/components/states/forbidden-state.tsx', 'Acesso Restrito', 'ForbiddenState must reference restricted access');
  });
});
