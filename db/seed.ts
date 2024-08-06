/**
 * @description
 * ローカルのsqliteにダミーデータを挿入する
 * $ bun seed
 */

import { Database } from 'bun:sqlite'
import { postFixture, userFixture } from '@/__tests__'
import type { Post, User } from '@/schemas'
import { drizzle } from 'drizzle-orm/bun-sqlite'

import { posts, users } from './schemas'
import * as schema from './schemas'

const sqlite = new Database('./.mf/d1/DB/db.sqlite')
const db = drizzle(sqlite, { schema })

console.log('Seeding Started...')

const newUsers: User[] = new Array(10).fill(0).map(() => userFixture.build())
await db.insert(users).values(newUsers)

const newPosts: Post[] = new Array(20)
  .fill(0)
  .map(() =>
    postFixture.build({
      userId: newUsers[Math.floor(Math.random() * newUsers.length)].id,
    }),
  )
  .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
await db.insert(posts).values(newPosts)

console.log('Seeding Completed!')
