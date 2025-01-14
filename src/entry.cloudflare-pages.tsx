/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for Cloudflare Pages when building for production.
 *
 * Learn more about the Cloudflare Pages integration here:
 * - https://qwik.builder.io/docs/deployments/cloudflare-pages/
 *
 */
import { createQwikCity } from '@builder.io/qwik-city/middleware/cloudflare-pages'
import type { PlatformCloudflarePages } from '@builder.io/qwik-city/middleware/cloudflare-pages'
import qwikCityPlan from '@qwik-city-plan'
import { manifest } from '@qwik-client-manifest'
import render from './entry.ssr'

declare global {
  interface QwikCityPlatform extends PlatformCloudflarePages {
    env: {
      DB: D1Database
      KV: KVNamespace
    }
  }
}

const fetch = createQwikCity({ render, qwikCityPlan, manifest })

export { fetch }
