/**
 * @description
 * DBのスキーマをTypeScriptで型定義したもの
 * DBフィールドに対する型注釈は基本的にこれを利用する
 */

import type { InferInsertModel, InferSelectModel, Table } from 'drizzle-orm'
import type * as schema from '.'

export type User = InferSelectModel<typeof schema.users>
export type UserInsert = InferInsertModel<typeof schema.users>

export type Post = InferSelectModel<typeof schema.posts>
export type PostInsert = InferInsertModel<typeof schema.posts>
