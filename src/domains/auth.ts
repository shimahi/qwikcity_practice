import { KVService } from '@/services/kv'
import { AuthError } from '@auth/core/errors'
import type { RequestEventCommon } from '@builder.io/qwik-city'

/**
 * @description authorize
 * 認証を行い、ログインユーザーの情報を取得する
 * セッションの認証情報を元にKVに保存されたUserデータの一部を返す
 * @param RequestEventAction QwikCityサーバのリクエストイベント
 * @param {boolean} throwWhenUnauthenticated 認証されていない場合にエラーを投げるかどうか
 * @returns {AuthUser} 認証ユーザー情報
 */
export async function authorize(
  /** リクエストイベント */
  requestEvent: RequestEventCommon<QwikCityPlatform>,
  /** 認証されていない場合に例外をスローするかどうか  */
  throwWhenUnauthenticated = false,
) {
  // Auth.jsの"session"コールバックで付与されたセッション情報を取得する
  const session = requestEvent.sharedMap.get('session') as {
    kvAuthKey?: string
  } | null

  if (!session?.kvAuthKey) {
    if (throwWhenUnauthenticated) {
      throw new AuthError('Unauthorized')
    }
    return null
  }

  // セッションに保存されたkeyを元にKVからユーザー情報を取得する
  const kvSerice = new KVService(requestEvent)
  const stringifiedUser = await kvSerice.user.get()
  if (!stringifiedUser) {
    if (throwWhenUnauthenticated) {
      throw new AuthError('Unauthorized')
    }
    return null
  }

  return stringifiedUser
}
