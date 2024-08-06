import { type UserInsert, users } from '@/schemas'
import { eq } from 'drizzle-orm'
import { DBServiceBase } from './_base'

export class UserDBService extends DBServiceBase {
  /**
   * ユーザーを作成する
   * @param {UserInsert} input
   */
  async create(input: UserInsert) {
    return this.drizzle.insert(users).values(input).returning().get()
  }

  /**
   * ユーザーを更新する
   * @param {string} id
   * @param {Partial<User>} inputs
   */
  async update(id: string, inputs: Partial<UserInsert>) {
    return this.drizzle
      .update(users)
      .set(inputs)
      .where(eq(users.id, id))
      .returning()
      .get()
  }

  /**
   * offsetを視点にlimit(デフォルト10)単位でユーザーを取得する
   * @param {number} limit 取得する件数
   * @param {number} offset 取得する開始位置
   */
  async paginate({
    limit = 10,
    offset = 0,
  }: { limit?: number; offset?: number } = {}) {
    return this.drizzle.query.users.findMany({
      orderBy: (posts, { desc }) => desc(posts.createdAt),
      limit,
      offset,
    })
  }

  /**
   * ユーザーIDからユーザーを取得する
   * @param {string} userId
   */
  async get(userId: string) {
    return this.drizzle.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      with: {
        posts: {
          orderBy: (posts, { desc }) => desc(posts.createdAt),
          limit: 20,
        },
      },
    })
  }

  /**
   * googleProfileIdからユーザーを取得する
   * @param {string} googleProfileId
   */
  async getByGoogleProfileId(googleProfileId: string) {
    return this.drizzle.query.users.findFirst({
      where: (users, { eq }) => eq(users.googleProfileId, googleProfileId),
    })
  }
}
