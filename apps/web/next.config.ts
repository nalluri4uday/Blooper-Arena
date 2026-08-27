import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@blooper-arena/database',
    '@blooper-arena/game-engine',
    '@blooper-arena/shared',
  ],
};

export default nextConfig;
