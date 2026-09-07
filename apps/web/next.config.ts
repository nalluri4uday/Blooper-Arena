import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';
import { withSentryConfig } from '@sentry/nextjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: [
    '@blooper-arena/database',
    '@blooper-arena/trading-engine',
    '@blooper-arena/shared',
  ],
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  sourcemaps: {
    disable: true,
  },
});
