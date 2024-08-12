import type { User } from '@/schemas'
import { UserDBService } from '@/services/db/user'
import { KVService } from '@/services/kv'
import type { RequestEventBase } from '@builder.io/qwik-city'
import cuid from 'cuid'

export class UserDomain {
  private readonly userDB: UserDBService
  private readonly kvUser: KVService['user']

  constructor(requestEvent: RequestEventBase<QwikCityPlatform>) {
    this.userDB = new UserDBService(requestEvent.platform.env.DB)
    this.kvUser = new KVService(requestEvent).user
  }

  /**
   * ユーザー一覧をページネーションで取得する
   */
  paginate({
    limit = 30,
    offset = 0,
  }: Parameters<UserDBService['paginate']>[0] = {}) {
    return this.userDB.paginate({ limit, offset })
  }

  /**
   * IDに一致するユーザーを取得する
   * @param {string} id
   */
  get(id: User['id']) {
    return this.userDB.get(id)
  }

  /**
   * 認証プロバイダーのプロファイルIDからユーザーを作成する
   * 既に存在する場合は作成をスキップして、そのユーザーを返す
   * @param {ProfileIds} profileIds 検索したいプロファイルIDのカラム名
   * @param {string} profileId プロファイルID
   * @prams inputs その他のユーザー情報
   */
  async create(
    profileIds: ProfileIds,
    inputs: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'googleProfileId'>,
  ) {
    const { key, profileId } = parseProfileId(profileIds)
    const user = await this.getByProfileIds(profileIds)

    // 既にユーザーがいればreturn
    if (user) return user

    const params = {
      // CUIDを生成し、ユーザーIDとする。
      id: cuid(),
      ...inputs,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(() => {
        switch (key) {
          case 'googleProfileId':
            return { googleProfileId: profileId }
        }
      })(),
    }

    return this.userDB.create(params).catch(() =>
      // accountIdが重複している場合はaccountIdにランダムな文字列を付与して再度登録する
      this.userDB.create({
        ...params,
        accountId: `${params.accountId}${cuid().slice(4)}`,
      }),
    )
  }

  /**
   * ユーザーを更新する。DBを更新したらKVのログインユーザー情報も更新する
   * @param {string} id ユーザーID
   * @param {Partial<User>} inputs 更新したいユーザー情報
   */
  async update(id: User['id'], inputs: Partial<User>) {
    return this.userDB.update(id, inputs).then(async () => {
      const userKv = await this.kvUser.get()
      if (!userKv) return

      return this.kvUser.put({
        ...userKv,
        ...inputs,
      })
    })
  }

  /**
   * 認証プロバイダーのプロファイルIDからユーザーを取得する
   * @param {ProfileIds} profileIds 検索したいプロファイルIDの {カラム名: プロファイルID}のオブジェクト
   * @param {string} profileId プロファイルID
   */
  getByProfileIds(profileIds: ProfileIds) {
    const { key, profileId } = parseProfileId(profileIds)

    switch (key) {
      case 'googleProfileId':
        return this.userDB.getByGoogleProfileId(profileId)
    }
  }
}

type ProfileIds = Pick<User, 'googleProfileId'>
/**
 * プロファイルIDのオブジェクトに対して、有効なカラム名とプロファイルIDを返す
 * @param profileIds
 * @returns
 */
function parseProfileId(profileIds: ProfileIds) {
  const key = String(Object.keys(profileIds).find(Boolean)) as keyof ProfileIds
  const profileId = String(profileIds[key as keyof ProfileIds])

  return { key, profileId }
}
