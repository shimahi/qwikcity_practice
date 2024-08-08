/**
 * .env.localの環境変数キーを読み取り、
 * qwik-cityのEnvGetterインターフェースの型を更新する
 * これによりrequestEvent.env.getで型安全に環境変数を取得できるようになる
 */
import { readFileSync, writeFileSync } from 'node:fs'

// .env.localファイルのパス
const envLocalPath = './.env.local.example'
// targetファイルのパス
const targetFilePath =
  './node_modules/@builder.io/qwik-city/middleware/request-handler/index.d.ts'

// // .env.localファイルからキーを読み込む
const envKeys = readFileSync(envLocalPath, 'utf-8')
  .split('\n')
  .filter(line => line && !line.startsWith('#') && line.includes('='))
  .map(line => `"${line.split('=')[0].trim()}"`)

// // EnvGetterインターフェースを更新するためのキー文字列を生成
const envKeysString = envKeys.join(' | ')

// // targetファイルの内容を読み込む
let targetFileContent = readFileSync(targetFilePath, 'utf-8')

// // EnvGetterインターフェースのgetメソッドの型を更新
targetFileContent = targetFileContent.replace(
  /export declare interface EnvGetter {([\s\S]*?)}/,
  `export declare interface EnvGetter { get(key: ${envKeysString}): string; }`
)

// // 更新した内容でtargetファイルを上書き
writeFileSync(targetFilePath, targetFileContent)

console.log('EnvGetter interface is updated.')
