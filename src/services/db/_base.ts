import * as schema from '@/schemas'
import { drizzle } from 'drizzle-orm/d1'

export abstract class DBServiceBase {
  protected readonly drizzle

  constructor(DB: D1Database) {
    this.drizzle = drizzle(DB, {
      schema,
    })
  }
}
