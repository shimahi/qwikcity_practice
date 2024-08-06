import { sortByCreatedAt } from '@/utils'

import { afterEach, beforeEach, describe, expect, test } from 'bun:test'

import { postFixture, requestEventMock, userFixture } from '@/__tests__'
import { setupDBMock } from '@/__tests__/mocks/db'
import { posts, users } from '@/schemas'
import { PostDBService } from '@/services/db/post'
import { faker } from '@faker-js/faker'

// drizzleインスタンスとモジュールのモック
const drizzle = setupDBMock()

// 各テスト終了時にテーブルの中身を空にする
afterEach(async () => {
  await drizzle.delete(posts).run()
  await drizzle.delete(users).run()
})

/**
 * =============================
 * テストケースの実装
 * =============================
 */

describe('#create', () => {
  const postData = postFixture.build()

  describe('入力パラメータが正常な場合', () => {
    const subject = new PostDBService(requestEventMock.platform.env.DB)
    test('ポストレコードが作成されること', async () => {
      const result = await subject.create(postData)

      expect(result).toEqual(postData)
    })
  })
})

describe('#paginate', () => {
  describe('パラメータが指定されていない場合', () => {
    const newUsers = new Array(5).fill(0).map(() => userFixture.build())
    const newPosts = new Array(30).fill(0).map(() =>
      postFixture.build({
        createdAt: faker.date.past(),
        userId: newUsers[Math.floor(Math.random() * newUsers.length)].id,
      }),
    )

    beforeEach(async () => {
      await drizzle.insert(users).values(newUsers)
      await drizzle.insert(posts).values(newPosts)
    })
    test('createdAtの新しい順に最初の10件が取得されること', async () => {
      const subject = new PostDBService(requestEventMock.platform.env.DB)
      const result = await subject.paginate()

      expect(result.length).toEqual(10)
      result.forEach((post, index, result) => {
        expect(
          post.createdAt >
            (result[index + 1]?.createdAt ?? new Date('1970-01-01')),
        ).toBeTruthy()
        expect(result[index].id).toEqual(sortByCreatedAt(newPosts)[index].id)
      })
    })
  })
  describe('offsetパラメータを指定した場合', () => {
    const newUsers = new Array(5).fill(0).map(() => userFixture.build())
    const newPosts = new Array(30).fill(0).map(() =>
      postFixture.build({
        createdAt: faker.date.past(),
        userId: newUsers[Math.floor(Math.random() * newUsers.length)].id,
      }),
    )

    beforeEach(async () => {
      await drizzle.insert(users).values(newUsers)
      await drizzle.insert(posts).values(newPosts)
    })
    test('offsetを始点にした10件が取得されること', async () => {
      const subject = new PostDBService(requestEventMock.platform.env.DB)
      const result = await subject.paginate({ offset: 10 })
      expect(result.length).toEqual(10)
      expect(result.map(({ id }) => id)).toEqual(
        sortByCreatedAt(newPosts)
          .slice(10, 20)
          .map(({ id }) => id),
      )
    })
  })
})

describe('#paginateByUserId', () => {
  const userId = faker.string.alphanumeric()
  const otherUserId = faker.string.alphanumeric()
  describe('パラメータが指定されていない場合', () => {
    const newPosts = new Array(50).fill(10).map((_, index) =>
      postFixture.build({
        userId: index % 2 === 0 ? userId : otherUserId,
        createdAt: faker.date.past(),
      }),
    )

    beforeEach(async () => {
      await drizzle.insert(posts).values(newPosts)
    })
    test('ユーザーIDの一致する最初の10件が取得されること', async () => {
      const subject = new PostDBService(requestEventMock.platform.env.DB)
      const result = await subject.paginateByUserId(userId)

      result.forEach((post, index, result) => {
        expect(post.userId).toEqual(userId)
        expect(post.userId).not.toEqual(otherUserId)
        expect(
          post.createdAt >
            (result[index + 1]?.createdAt ?? new Date('1970-01-01')),
        ).toBeTruthy()
      })
    })
  })
})

describe('#get', () => {
  const userData = userFixture.build()
  const postData = postFixture.build({
    userId: userData.id,
  })

  beforeEach(async () => {
    await drizzle.insert(users).values(userData)
    await drizzle.insert(posts).values(postData)
  })

  describe('入力パラメータが正常な場合', () => {
    const subject = new PostDBService(requestEventMock.platform.env.DB)
    test('指定したIDのポストが変えること', async () => {
      const result = await subject.get(postData.id)

      expect(result).toEqual({
        ...postData,
        user: userData,
      })
    })
  })
  describe('指定したIDのポストが存在しない場合', () => {
    const subject = new PostDBService(requestEventMock.platform.env.DB)
    test('undefinedが返されること', async () => {
      const result = await subject.get(faker.string.alphanumeric())

      expect(result).toBeUndefined()
    })
  })
})
describe('#update', () => {
  const userData = userFixture.build()
  const postData = postFixture.build({
    userId: userData.id,
  })

  beforeEach(async () => {
    await drizzle.insert(users).values(userData)
    await drizzle.insert(posts).values(postData)
  })
  test('ポストレコードが更新されること', async () => {
    const subject = new PostDBService(requestEventMock.platform.env.DB)
    const updatedPost = await subject.update(postData.id, {
      content: faker.lorem.sentence(),
    })
    const result = await subject.get(postData.id)

    expect(result).toEqual({ ...updatedPost, user: userData })
  })
})

describe('#delete', () => {
  const postData = postFixture.build()

  beforeEach(async () => {
    const subject = new PostDBService(requestEventMock.platform.env.DB)
    await subject.create(postData)
  })
  test('ポストレコードが削除されること', async () => {
    const subject = new PostDBService(requestEventMock.platform.env.DB)
    await subject.delete(postData.id)
    const result = await subject.get(postData.id)

    expect(result).toBeUndefined()
  })
})
