import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';
/** @type {import('next').NextConfig} */
export default function nextConfig(phase) {
  return {
    reactStrictMode: true,
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-hunt-dev' : '.next-hunt',
    webpack(config, { isServer }) {
      if (isServer) config.externals.push({ 'node:sqlite': 'commonjs node:sqlite' });
      return config;
    },
  };
}
