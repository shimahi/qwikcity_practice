import { $ } from 'zx'

console.log('Starting setup...')
console.log('パッケージのインストールを行います。')

// node_modulesの再インストール
await $`rm -rf node_modules || true`
await $`bun install`

console.log('パッケージのインストールが完了しました。')
console.log('- - - - - - - - -')
console.log('ローカル環境変数ファイルのコピーを行います。')

// ローカル環境変数ファイルのコピー
await $`if [ ! -f .env.local ]; then cp .env.local.example .env.local; fi`

console.log('ローカル環境変数ファイルのコピーが完了しました。')
console.log('- - - - - - - - -')
console.log('ローカルDBの初期化を行います。')

await $`rm -rf .mf || true`

console.log('マイグレーションファイルの生成中...')
await $`bun run drizzle-kit generate:sqlite`

console.log('マイグレーションの実行中...')
await $`mkdir -p ./.mf/d1/DB && touch ./.mf/d1/DB/db.sqlite && drizzle-kit push:sqlite`

console.log('シーディングの実行中...')
await $`bun run ./db/seed.ts`

console.log('ローカルDBの初期化が完了しました。')
console.log('- - - - - - - - -')

console.log('パッチの実行を行います。')
await $`cp -f patches/drizzle-session.js node_modules/drizzle-orm/bun-sqlite/session.js && bun run patches/env-types.js`
console.log('パッチの実行が完了しました。')

console.log('- - - - - - - - -')
console.log('Setup Completed!')
