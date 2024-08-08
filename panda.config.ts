import { defineConfig } from '@pandacss/dev'

export default defineConfig({
  jsxFramework: 'qwik',
  preflight: true,
  outdir: 'src/styled-system',
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  globalCss: {},
  theme: {
    extend: {},
  },
  utilities: {},
})
