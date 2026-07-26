import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // docs/*.md are read from disk at request time (docs/00_build_brief.md's
  // "doc loading" section) - trace them into the deployed function bundle.
  outputFileTracingIncludes: {
    "/api/generate": ["./docs/*.md"],
    "/api/build": ["./docs/*.md"],
  },
};

export default nextConfig;
