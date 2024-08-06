import { Database } from 'bun:sqlite'
import { afterAll, beforeAll, jest, mock } from 'bun:test'
import * as schema from '@/schemas'
import { drizzle as drizzleORM } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'

/**
 * @description
 * テスト用のDB環境のセットアップ
 * 一時的なSQLiteデータベースを作成し、drizzle-orm/d1モジュールをモックする
 *
 * FIXME: MiniflareでD1Databaseのバインディングをしてモックを行いたいが、現状Bunがworker_threadsに対応していないため、暫定的にsqliteでテストを行う
 * https://github.com/oven-sh/bun/issues/4165
 */
export function setupDBMock() {
  // SQLiteの仮想DBをメモリ上に作成
  const sqlite = new Database(':memory:')
  // drizzleインスタンスを作成
  const drizzle = drizzleORM(sqlite, { schema })

  /** drizzleモジュールのインポートをモックする */
  mock.module('drizzle-orm/d1', () => ({
    drizzle: jest.fn().mockImplementation(() => drizzle),
  }))

  // DBマイグレーションを実行
  beforeAll(() => {
    migrate(drizzle, { migrationsFolder: 'db/migrations' })
  })

  // 全テスト終了後、メモリ内の仮想DBを削除
  afterAll(() => {
    sqlite.prepare('DROP TABLE users').run()
    sqlite.prepare('DROP TABLE posts').run()
    sqlite.close()
    jest.clearAllMocks()
  })

  return drizzle
}
