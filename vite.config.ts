import { qwikCity } from '@builder.io/qwik-city/vite'
import { qwikVite } from '@builder.io/qwik/optimizer'
import { macroPlugin } from '@builder.io/vite-plugin-macro'
import { Miniflare } from 'miniflare'

/**
 * This is the base config for vite.
 * When building, the adapter config is used which loads this file and extends it.
 */
import { type UserConfig, defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json'
const { dependencies = {}, devDependencies = {} } = pkg as any as {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  [key: string]: unknown
}
/**
 * Note that Vite normally starts from `index.html` but the qwikCity plugin makes start at `src/entry.ssr.tsx` instead.
 */

export default defineConfig(async ({ command, mode }): Promise<UserConfig> => {
  let platform = {}
  if (mode === 'ssr') {
    // The following miniflare statements are heavily inspired by the source of the `wrangler execute` CLI command.
    // @see https://github.com/cloudflare/workers-sdk/blob/24d1c5cf3b810e780df865a0f76f1c3ae8ed5fbe/packages/wrangler/src/d1/execute.tsx#L236-L251
    /**
     * The `d1Persist` directory is created after you've executed `wrangler execute *database_name* --local`.
     */
    const d1Persist = './.mf/d1'
    const mf = new Miniflare({
      modules: true,
      script: '',
      d1Persist,
      d1Databases: ['DB'],
      kvNamespaces: ['KV'],
    })
    const db = await mf.getD1Database('DB')
    const kv = await mf.getKVNamespace('KV')

    platform = {
      env: { DB: db, KV: kv },
    }
  }
  return {
    resolve: {
      alias: [
        { find: '@/schemas', replacement: '/db/schemas' },
        { find: '@', replacement: '/src' },
      ],
    },
    plugins: [
      macroPlugin({ preset: 'pandacss' }),
      qwikCity({ platform }),
      qwikVite(),
      tsconfigPaths(),
    ],
    // This tells Vite which dependencies to pre-build in dev mode.
    optimizeDeps: {
      // Put problematic deps that break bundling here, mostly those with binaries.
      // For example ['better-sqlite3'] if you use that in server functions.
      include: ['@auth/core'],
      exclude: [],
    },
    // This tells Vite how to bundle the server code.
    ssr:
      command === 'build' && mode === 'production'
        ? {
            // All dev dependencies should be bundled in the server build
            noExternal: Object.keys(devDependencies),
            // Anything marked as a dependency will not be bundled
            // These should only be production binary deps (including deps of deps), CLI deps, and their module graph
            // If a dep-of-dep needs to be external, add it here
            // For example, if something uses `bcrypt` but you don't have it as a dep, you can write
            // external: [...Object.keys(dependencies), 'bcrypt']
            external: Object.keys(dependencies),
          }
        : undefined,
    server: {
      headers: {
        // Don't cache the server response in dev mode
        'Cache-Control': 'public, max-age=0',
      },
    },
    preview: {
      headers: {
        // Do cache the server response in preview (non-adapter production build)
        'Cache-Control': 'public, max-age=600',
      },
    },
  }
})
