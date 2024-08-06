import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { requestEventMock, userFixture } from '@/__tests__'
import { setupDBMock } from '@/__tests__/mocks/db'
import { users } from '@/schemas'
import { UserDBService } from '@/services/db/user'

import { faker } from '@faker-js/faker'

const drizzle = setupDBMock()

// 各テスト終了時にテーブルの中身を空にする
afterEach(async () => {
  await drizzle.delete(users).run()
})

/**
 * =============================
 * テストケースの実装
 * =============================
 */

describe('#create', () => {
  const subject = new UserDBService(requestEventMock.platform.env.DB)
  const userData = userFixture.build()
  describe('入力パラメータが正常な場合', () => {
    test('ユーザーレコードが作成されること', async () => {
      const result = await subject.create(userData)

      expect(result).toEqual(userData)
    })
  })
  describe('accountIdが重複している場合', () => {
    const userData1 = userFixture.build()
    const userData2 = userFixture.build({
      accountId: userData1.accountId,
    })

    beforeEach(async () => {
      await drizzle.insert(users).values(userData1).run()
    })

    test('エラーが投げられること', async () => {
      expect(() => subject.create(userData2)).toThrow()
    })
  })
})

describe('#update', () => {
  const subject = new UserDBService(requestEventMock.platform.env.DB)
  const userId = faker.string.uuid()
  const userData = userFixture.build({
    id: userId,
  })
  const inputs = {
    displayName: faker.person.firstName(),
    bio: faker.lorem.sentence(),
  }

  beforeEach(async () => {
    await drizzle.insert(users).values(userData).run()
  })

  test('ユーザー情報が更新されること', async () => {
    const result = await subject.update(userId, inputs)

    expect(result).toEqual({
      ...userData,
      ...inputs,
    })
  })
})

describe('#paginate', () => {
  const subject = new UserDBService(requestEventMock.platform.env.DB)

  const userData1 = userFixture.build()
  const userData2 = userFixture.build()

  beforeEach(async () => {
    await drizzle.insert(users).values(userData1).run()
    await drizzle.insert(users).values(userData2).run()
  })

  test('すべてのユーザー情報が取得できる', async () => {
    const result = await subject.paginate()

    expect(result).toEqual([userData1, userData2])
  })
})

describe('#get', () => {
  const userId = faker.string.uuid()
  const userData1 = userFixture.build()
  const userData2 = userFixture.build()
  const target = userFixture.build({
    id: userId,
  })
  beforeEach(async () => {
    await drizzle.insert(users).values(userData1).run()
    await drizzle.insert(users).values(userData2).run()
    await drizzle.insert(users).values(target).run()
  })

  test('ユーザーIDからユーザー情報が取得できる', async () => {
    const subject = new UserDBService(requestEventMock.platform.env.DB)
    const result = await subject.get(userId)

    expect(result).toEqual({
      ...target,
      posts: [],
    })
  })
})

describe('#getByGoogleProfileId', () => {
  const subject = new UserDBService(requestEventMock.platform.env.DB)
  const googleProfileId = faker.string.uuid()

  const userData1 = userFixture.build()
  const userData2 = userFixture.build()
  const target = userFixture.build({
    googleProfileId,
  })
  beforeEach(async () => {
    await drizzle.insert(users).values(userData1).run()
    await drizzle.insert(users).values(userData2).run()
    await drizzle.insert(users).values(target).run()
  })

  test('GoogleプロファイルIDからユーザー情報が取得できる', async () => {
    const result = await subject.getByGoogleProfileId(googleProfileId)

    expect(result).toEqual(target)
  })
})
