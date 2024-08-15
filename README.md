# Qwik City Boilerplate

### About

[Qwik](https://qwik.builder.io/) で作成したアプリを [Cloudflare Pages](https://pages.cloudflare.com/) 上で構築するためのボイラープレートです。

### スタック

- JavaScript 実行ランタイム - [Bun](https://bun.sh/)
- ビルドツールチェイン - [Vite](https://ja.vitejs.dev/)
- ホスティング - [Cloudflare Pages](https://pages.cloudflare.com/)
- UI - [Qwik](https://qwik.builder.io/)
- FW - [Qwik City](https://qwik.dev/docs/qwikcity/)
- スタイリング - [Panda CSS](https://panda-css.com/)
- KVS - [Cloudflare KV](https://developers.cloudflare.com/kv/) 
- データベース - [Cloudflare D1](https://developers.cloudflare.com/d1/) 
- ORM - [Drizzle](https://orm.drizzle.team/)
- Linter & Formatter - [Biome](https://biomejs.dev/ja/)
- テスト [Bun](https://bun.sh/docs/cli/test)

### ローカル環境構築

0. Cloudflare Pages のプロジェクトと、必要に応じて Cloudflare D1・R2・KV のプロジェクトを作成する。

- [Get started - Pages](https://developers.cloudflare.com/pages/get-started/guide/)

1. ローカル環境のセットアップコマンドを実行。
   パッケージインストールと環境変数ファイルのコピー、パッチスクリプトの実行、ローカルDBの初期化が行われる。

```bash
# ローカル環境のセットアップ
$ bun setup
```

2. ローカルサーバーの起動し、アプリを確認する。

```bash
# ローカルサーバーの起動
$ bun dev
# → http://localhost:5173/ にアプリが起動する
```

### ディレクトリ構成

- .mf/ Miniflareでバインディングされたローカル上のd1,KVのデータ
- adapters/ QwikCityアプリをデプロイ先のプラットフォーム(Cloudflare)に合わせてビルドするためのviteの設定
- **db/** データベース関連
  - migrations drizzle-kit によって生成されたマイグレーションファイルが格納される
  - **schemas** DBのスキーマを記述する
  - **seed.ts** ローカル環境DBに仮データを挿入するためのシーディング処理を記述する
- dist/ ビルドによって生成されたファイル群
- patches/ 開発をサポートするためにライブラリを書き換えたりするパッチ
- **src/** アプリケーションの実装
  - _\_tests\_\_ テストコードに用いる処理を定義する
    - fixtures/ DBのテストデータに関する処理
    - mocks/ 各処理系のモックオブジェクトを作成
  - **components/** フロントエンド側でインタラクションを行う共通コンポーネントを記述する
  - **domains/** サーバーサイドでのドメインロジックを記述する
  - **hooks/** フロントエンドで用いる共通カスタムフック
  - **routes/** QwikCityにおけるルーティング定義ファイル cf) https://qwik.dev/docs/routing/
  - **services/** サーバーサイドで永続層や外部クライアント、ライブラリ処理系を扱うためのモジュールに関する処理
  - styled-system/ Panda CSSによって自動生成されたCSSクライアントが入る
  - **utils/** ドメインに依存しないユーティリティロジックを記載する
- **public/** Web サーバ上に直接配置するファイル。アセットファイルなどを置く。クライアントサイドからは `/` で参照できる
  - .env.local (ignored) ローカル環境で使用する環境変数
  - biome.json [Biome](https://biomejs.dev/)の設定ファイル。FormatterとLinterの設定を行う
  - drizzle.config.ts [Drizzle](https://orm.drizzle.team/)の設定ファイル。ローカルDBのマイグレーション設定を行う。
  - lefthook.yml [Lefthook](https://github.com/evilmartians/lefthook)の設定ファイル。コミット時に呼ばれる処理の設定を行う。
  - panda.config.ts [Panda CSS](https://panda-css.com/)の設定ファイル。デザインシステムを定義する 
  - postcss.config.cjs Panda CSSを適用させるためのPostCSS設定
  - README\.md 今読んでいるやつ
  - vite.config.ts [Vite](https://ja.vitejs.dev/)の設定ファイル
  - wrangler.toml Cloudflareの設定ファイル。CI上でのみ利用する

### DB スキーマ更新のマイグレーション

`db/schemas/index.ts` にはデータベースのスキーマが drizzle で定義されており、また`db/seed.ts` にはローカル DB に仮データを挿入するためのシーディング処理が実装されている。

これらのファイルを編集した後、以下のコマンドでマイグレーションを実行する。

```bash
# マイグレーションファイルの生成・ローカルDBへの適用を行う
$ bun run db:migrate

# ローカルのシーディング
$ bun run db:seed
```

### デプロイ

Cloudflare Pages と GitHub リポジトリの連携を行うと、production ブランチに push された際に自動的にデプロイが行われる。

[Deploy your site - Cloudflare Pages Doc](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)


### その他

- D1への編集権を持つCloudflareトークンを作成し、GitHub Secretsに設定する → GitHub ActionsでリモートDBのマイグレーションが実行できるようになる


### FIXME

`$ bun test` で呼び出されるサーバーのテストではDBモジュールのモックがうまくリセットできなかったため、単体テストのモックの影響が別のテストに影響を与えてテストが失敗する。

package.json の "test" スクリプトにて、ディレクトリ単位で単体テストを行うようにして、モックの影響を疎にしている。

```
$ bun run test
```
