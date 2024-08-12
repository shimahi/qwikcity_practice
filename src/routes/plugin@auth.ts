import { UserDomain } from '@/domains/user'
import { KVService } from '@/services/kv'
import type { Provider } from '@auth/core/providers'
import Google from '@auth/core/providers/google'
import { serverAuth$ } from '@builder.io/qwik-auth'

/**
 * @description
 * ログイン・認証機能に関する一連の処理
 * QwikCityのAuth.jsプラグインを用いて、認証・認可を行い、その前後の処理をここで記述する
 * https://qwik.builder.io/docs/integrations/authjs
 */
export const { onRequest, useAuthSession, useAuthSignin, useAuthSignout } =
  serverAuth$((requestEvent) => {
    const userDomain = new UserDomain(requestEvent)
    const kvService = new KVService(requestEvent)
    const { env, sharedMap } = requestEvent

    return {
      secret: env.get('AUTH_SECRET') ?? '#',
      trustHost: true,
      providers: [
        Google({
          clientId: env.get('GOOGLE_AUTH_CLIENT_ID') ?? '#',
          clientSecret: env.get('GOOGLE_AUTH_CLIENT_SECRET') ?? '#',
        }),
      ] as Provider[],
      callbacks: {
        /** jwtセッションを使用している時(ログイン後以降)に呼び出される処理
         * ログイン直後の初回呼び出し時は account に値が入っており、これを元にユーザー情報を取得してKVに保存。KVのキーをjwtトークンに追加して返却する。
         */
        jwt: async ({ token, account }) => {
          if (!account || !token?.sub) {
            // ログイン直後ではない場合、現在のtokenを返す
            return token
          }
          // ログイン直後の場合に処理、tokenに認証情報を追加する
          token.provider = account.provider

          // すでにユーザーが存在する場合、そのユーザーとしてログインする
          const existingUser = await userDomain.getByProfileIds({
            googleProfileId: account.providerAccountId,
          })
          if (existingUser) {
            token.kvAuthKey = await kvService.user.put(existingUser)
            return token
          }

          // 新規登録の場合、Userを作成してログインする
          const user = await userDomain.create(
            { googleProfileId: account.providerAccountId },
            {
              displayName: token.name ?? 'Jane Doe',
              accountId: `${token.email?.split('@')[0].replace(/\./g, '')}`,
              bio: '',
              avatarUrl: token.picture ?? null,
            },
          )
          token.kvAuthKey = await kvService.user.put(user)
          return token
        },
        /**
         * セッションがチェックされると呼び出される処理
         * jwtコールバックで追加した情報をセッションに追加する
         * これらのセッション情報はsharedMap.get('session')を用いて参照できる
         */
        session: async ({ session, token }) => {
          return {
            ...session,
            kvAuthKey: token?.kvAuthKey,
            provider: token?.provider,
          }
        },
        /**
         * ログイン/ログアウト時に呼び出される処理
         * ログアウト時にはKVからユーザー情報を削除する
         */
        redirect: async ({ baseUrl }) => {
          const kvAuthKey: string | null = sharedMap.get('session')?.kvAuthKey

          if (kvAuthKey) {
            await kvService.user.delete(kvAuthKey)
          }

          return baseUrl
        },
      },
    }
  })
