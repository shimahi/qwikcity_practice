import { afterAll, describe, expect, jest, mock, test } from 'bun:test'
import {
  postDBServiceMock,
  postInputFixture,
  requestEventMock,
} from '@/__tests__'
import { faker } from '@faker-js/faker'
import { PostDomain } from './post'

/**
 * =============================
 * テスト環境のセットアップ
 * =============================
 */
// PostDomainの依存モジュールをモックする
mock.module('@/services/db/post', () => ({
  PostDBService: jest.fn().mockImplementation(() => postDBServiceMock),
}))

afterAll(() => {
  jest.clearAllMocks()
})

/**
 * =============================
 * テストケースの実装
 * =============================
 */
describe('#create', () => {
  const subject = new PostDomain(requestEventMock)
  const userId = faker.lorem.word()
  const input = postInputFixture.build()
  test('userIdとinputを引数にpostDB.createがコールされること', async () => {
    await subject.create(userId, input)

    expect(postDBServiceMock.create).toHaveBeenCalledWith({
      id: expect.any(String),
      userId,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      ...input,
    })
  })
})

describe('#paginate', () => {
  const subject = new PostDomain(requestEventMock)
  test('引数を指定しない場合、そのままpostDB.paginateがコールされること', async () => {
    await subject.paginate()

    expect(postDBServiceMock.paginate).toHaveBeenCalled()
  })
  test('引数を指定した場合、それに応じてpostDB.paginateがコールされること', async () => {
    const pageInput = { limit: faker.number.int(), offset: faker.number.int() }
    await subject.paginate(pageInput)

    expect(postDBServiceMock.paginate).toHaveBeenCalledWith(pageInput)
  })
})

describe('#paginatePostsByUserId', () => {
  const subject = new PostDomain(requestEventMock)
  const userId = faker.lorem.word()
  test('userIdのみを指定しない場合、userIdに応じたpostDB.paginateByUserIdがlimit=0,offset=0でコールされること', async () => {
    await subject.paginateByUserId(userId)

    expect(postDBServiceMock.paginateByUserId).toHaveBeenCalledWith(userId, {
      limit: 10,
      offset: 0,
    })
  })
  test('userIdとページネーション引数を指定した場合、それに応じてpostDB.paginateByUserIdがコールされること', async () => {
    const pageInput = { limit: faker.number.int(), offset: faker.number.int() }

    await subject.paginateByUserId(userId, pageInput)

    expect(postDBServiceMock.paginateByUserId).toHaveBeenCalledWith(
      userId,
      pageInput,
    )
  })
})

describe('#get', () => {
  const subject = new PostDomain(requestEventMock)
  const postId = faker.lorem.word()
  test('IDを引数にpostDB.getがコールされること', async () => {
    await subject.get(postId)

    expect(postDBServiceMock.get).toHaveBeenCalledWith(postId)
  })
})

describe('#update', () => {
  const subject = new PostDomain(requestEventMock)
  const postId = faker.lorem.word()
  const updateData = {
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
  }
  test('IDと更新データを引数にpostDB.updateがコールされること', async () => {
    await subject.update(postId, updateData)

    expect(postDBServiceMock.update).toHaveBeenCalledWith(postId, {
      ...updateData,
      updatedAt: expect.any(Date),
    })
  })
})

describe('#delete', () => {
  const subject = new PostDomain(requestEventMock)
  const postId = faker.lorem.word()
  test('IDを引数にpostDB.deleteがコールされること', async () => {
    await subject.delete(postId)

    expect(postDBServiceMock.delete).toHaveBeenCalledWith(postId)
  })
})
