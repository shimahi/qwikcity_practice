import { jest } from 'bun:test'
import type { RequestEventBase } from '@builder.io/qwik-city'

/**
 * @description
 * テストで用いるモックデータのうち、共通で用いるものを定義
 * 各種クラスオブジェクトとコンテキストをモックする
 */

// サーバ環境のコンテキストのモック
export const requestEventMock: RequestEventBase<QwikCityPlatform> = {
  ...({
    sharedMap: {
      get: jest.fn(),
    } as unknown as RequestEventBase<QwikCityPlatform>['sharedMap'],
  } as RequestEventBase<QwikCityPlatform>),
  platform: {
    ...({} as QwikCityPlatform),
    env: {
      DB: jest.fn()(),
      KV: jest.fn()(),
    },
  },
}

/**
 * KV層のモック
 */
export const kvServiceMock = {
  user: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}

/**
 * DB層のモック
 */
export const userDBServiceMock = {
  create: jest.fn(),
  update: jest.fn(),
  paginate: jest.fn(),
  get: jest.fn(),
  getByGoogleProfileId: jest.fn(),
}
export const postDBServiceMock = {
  create: jest.fn(),
  paginate: jest.fn(),
  paginateByUserId: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}
