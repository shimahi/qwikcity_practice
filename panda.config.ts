import { defineConfig, defineRecipe } from '@pandacss/dev'

export default defineConfig({
  jsxFramework: 'qwik',
  preflight: true,
  outdir: 'src/styled-system',
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  globalCss: {
    '*': {
      fontFamily:
        '"kanit", "Noto Sans JP", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif',
      whiteSpace: 'normal',
    },
  },
  theme: {
    extend: {
      textStyles: {
        heading: {
          description: 'ページの見出しの文字',
          value: {
            fontWeight: '500',
            fontSize: '32px',
            lineHeight: 1.46,
            letterSpacing: '0.05em',
            textDecoration: 'None',
            textTransform: 'None',
          },
        },
        button: {
          description: 'インタラクティブ要素全般に使用する文字',
          value: {
            fontSize: '16px',
            fontWeight: '700',
            lineHeight: '20.27px',
            letterSpacing: '0.05em',
            textDecoration: 'None',
            textTransform: 'None',
          },
        },
        input: {
          description: 'フォームの入力欄の文字',
          value: {
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '18px',
            letterSpacing: '0.05em',
          },
        },
        body: {
          description: '記事の文章などに用いる',
          value: {
            fontSize: '14px',
            fontWeight: '400',
            lineHeight: '18px',
            letterSpacing: '0.05em',
          },
        },
        subtitle1: {
          description: '大きめのサブタイトルの文字',
          value: {
            fontSize: '16px',
            fontWeight: '600',
            lineHeight: '23.17px',
            letterSpacing: '0.05em',
            textDecoration: 'None',
            textTransform: 'None',
          },
        },
        caption: {
          description: '日付など、補足に用いる小さい文字',
          value: {
            fontSize: '12px',
            fontWeight: '400',
            lineHeight: '17.94px',
            letterSpacing: '0.05em',
            textDecoration: 'None',
            textTransform: 'None',
          },
        },
      },
    },
  },
  utilities: {},
})