import type { Post } from '@/schemas'
import { PostDBService } from '@/services/db/post'
import type { RequestEventBase } from '@builder.io/qwik-city'
import cuid from 'cuid'

export class PostDomain {
  private readonly postDB

  constructor(requestEvent: RequestEventBase<QwikCityPlatform>) {
    this.postDB = new PostDBService(requestEvent.platform.env.DB)
  }

  /**
   * ポストを作成する
   * @param {string} userId
   * @param {Omit<Post, 'id' | 'userId' | 'createdAt' | 'updatedAt'>} input
   */
  create(
    userId: string,
    input: Omit<Post, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ) {
    return this.postDB.create({
      id: cuid(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...input,
    })
  }

  /**
   * ポスト一覧をページネーションで取得する
   * @param {number} limit 取得する件数
   * @param {number} offset 取得する開始位置
   */
  paginate({
    limit = 10,
    offset = 0,
  }: Parameters<PostDBService['paginate']>[0] = {}) {
    return this.postDB.paginate({ limit, offset })
  }

  /**
   * ユーザーIDに一致するポスト一覧をページネーションで取得する
   * @param {string} userId ユーザーID
   * @param {number} limit 取得する件数
   * @param {number} offset 取得する開始位置
   */
  paginateByUserId(
    userId: string,
    {
      limit = 10,
      offset = 0,
    }: Parameters<PostDBService['paginateByUserId']>[1] = {},
  ) {
    return this.postDB.paginateByUserId(userId, { limit, offset })
  }

  /**
   * IDに一致するポストを取得する
   * @param {string} id ポストID
   */
  get(id: Post['id']) {
    return this.postDB.get(id)
  }

  /**
   * ポストを更新する
   */
  update(
    id: Post['id'],
    input: Partial<Omit<Post, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ) {
    return this.postDB.update(id, {
      ...input,
      updatedAt: new Date(),
    })
  }

  /**
   * ポストを削除する
   * @param {string} id ポストID
   */
  delete(id: Post['id']) {
    return this.postDB.delete(id)
  }
}
