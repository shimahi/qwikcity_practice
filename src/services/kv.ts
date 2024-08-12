import type { User } from '@/schemas'
import type { RequestEventBase } from '@builder.io/qwik-city'

/**
 * 認証ユーザー情報の型
 * 認証情報をもとにKVから取得できるユーザー情報(の一部)
 */
export type AuthUser = Pick<
  User,
  'id' | 'accountId' | 'displayName' | 'bio' | 'avatarUrl'
>

/**
 * @description
 * Key-Valueストレージを操作するクラス
 * Cloudflare KVのAPIを使用してデータを保存、取得、削除する機能を実装する
 *
 * put(params) → paramsの値をKVに保存し、発行したキー値を返す。
 * get(key) → キー値に対応する値をKVから取得する
 * delete(key) → キー値に対応する値をKVから削除する
 */
export class KVService {
  private readonly kv
  private readonly kvAuthKey: string | undefined

  constructor(requestEvent: RequestEventBase<QwikCityPlatform>) {
    this.kv = requestEvent.platform.env.KV
    this.kvAuthKey = requestEvent.sharedMap.get('session')?.kvAuthKey
  }

  /**
   * ログインユーザーの情報
   * 認証時・ユーザーDB更新時にセットし、アプリ内で認可を行ったりユーザーのデータを表示したりする際に呼び出す。
   * キーはセッションに保存し、ログアウト時に破棄する
   */
  readonly user = {
    put: async (user: AuthUser) => {
      const kvAuthKey = this.kvAuthKey ?? `auth:${user.id}`

      await this.kv.put(
        kvAuthKey,
        JSON.stringify({
          id: user.id,
          accountId: user.accountId,
          displayName: user.displayName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
        }),
      )
      return kvAuthKey
    },
    /** 認証情報のキーはセッションに保存しているので、それを取得する */
    get: async () => {
      if (!this.kvAuthKey) return

      return this.kv.get<AuthUser>(this.kvAuthKey, { type: 'json' })
    },
    delete: (key: string) => {
      return this.kv.delete(key)
    },
  }
}
