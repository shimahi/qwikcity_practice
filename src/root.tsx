import { component$ } from '@builder.io/qwik'
import {
  QwikCityProvider,
  RouterOutlet,
  ServiceWorkerRegister,
} from '@builder.io/qwik-city'
import { RouterHead } from './components/router-head/router-head'

import './global.css'

export default component$(() => {
  /**
   * The root of a QwikCity site always start with the <QwikCityProvider> component,
   * immediately followed by the document's <head> and <body>.
   *
   * Don't remove the `<head>` and `<body>` elements.
   */

  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset: utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE: edge, chrome: 1" />
        <title>Qwik Summer</title>
        <meta name="description" content="Qwik App" />
        <meta property="og:title" content="Qwik App" />
        <meta
          property="og:description"
          content="Qwik Cityによるアプリケーション構築基盤"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://qwikcity-boilerplate.pages.dev"
        />
        <meta property="og:image" content="/og.png" />
        <meta name="keywords" content="Qwik App,Qwik City" />
        <link rel="manifest" href="/manifest.json" />

        <RouterHead />
        <ServiceWorkerRegister />
        {/* NOTE: NotoSansJPは重いので遅延読み込みする */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body lang="ja">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  )
})
