import {
  afterAll,
  beforeEach,
  describe,
  expect,
  jest,
  mock,
  test,
} from 'bun:test'
import {
  kvServiceMock,
  requestEventMock,
  userDBServiceMock,
  userFixture,
} from '@/__tests__'
import { faker } from '@faker-js/faker'
import { UserDomain } from './user'

/**
 * =============================
 * テスト環境のセットアップ
 * =============================
 */
// UserDomainの依存モジュールをモックする
mock.module('@/services/db/user', () => ({
  UserDBService: jest.fn().mockImplementation(() => userDBServiceMock),
}))

mock.module('@/services/kv', () => ({
  KVService: jest.fn().mockImplementation(() => kvServiceMock),
}))

afterAll(() => {
  jest.clearAllMocks()
})

/**
 * =============================
 * テストケースの実装
 * =============================
 */
describe('#paginate', () => {
  const subject = new UserDomain(requestEventMock)
  test('引数を指定しない場合、そのままuserDB.paginateがコールされること', async () => {
    await subject.paginate()

    expect(userDBServiceMock.paginate).toHaveBeenCalled()
  })
  test('引数を指定した場合、それに応じてuserDB.paginateがコールされること', async () => {
    const pageInput = { limit: faker.number.int(), offset: faker.number.int() }

    await subject.paginate(pageInput)

    expect(userDBServiceMock.paginate).toHaveBeenCalledWith(pageInput)
  })
})

describe('#get', () => {
  const subject = new UserDomain(requestEventMock)
  const userId = faker.string.uuid()
  test('userDB.getがコールされること', async () => {
    await subject.get(userId)

    expect(userDBServiceMock.get).toHaveBeenCalledWith(userId)
  })
})

describe('#create', () => {
  beforeEach(() => {
    userDBServiceMock.getByGoogleProfileId.mockClear()
    userDBServiceMock.create.mockClear()
  })

  describe('profileIdの一致するユーザーがすでにいる場合', () => {
    const subject = new UserDomain(requestEventMock)
    const userData = userFixture.build()

    beforeEach(() => {
      userDBServiceMock.getByGoogleProfileId.mockResolvedValue(userData)
    })

    test('userDB.createはコールされず、そのユーザーを返す', async () => {
      const result = await subject.create(
        { googleProfileId: userData.googleProfileId },
        {
          accountId: faker.lorem.word(),
          displayName: faker.person.firstName(),
          avatarUrl: faker.image.avatar(),
          bio: faker.lorem.sentence(),
        },
      )

      expect(userDBServiceMock.create).not.toHaveBeenCalled()
      expect(result).toEqual(userData)
    })
  })
  describe('profileIdの一致するユーザーがいない場合', () => {
    const subject = new UserDomain(requestEventMock)
    const { id, ...userData } = userFixture.build()

    beforeEach(() => {
      userDBServiceMock.getByGoogleProfileId.mockResolvedValue(null)
    })

    test('userDB.createがコールされること', async () => {
      await subject
        .create({ googleProfileId: faker.string.uuid() }, userData)
        .catch(() => {})

      expect(userDBServiceMock.create).toHaveBeenCalled()
    })
  })
  describe('新規作成時にすでにaccountIdが重複するユーザーがいる場合', () => {
    const subject = new UserDomain(requestEventMock)
    const userData = userFixture.build()

    beforeEach(() => {
      userDBServiceMock.getByGoogleProfileId.mockResolvedValue(null)
      userDBServiceMock.create
        .mockRejectedValueOnce(new Error(''))
        .mockResolvedValueOnce(userData)
    })

    test('userDB.createがaccountIdが重複しないように再度コールされること', async () => {
      await subject.create(
        { googleProfileId: userData.googleProfileId },
        userData,
      )
      expect(userDBServiceMock.create).toHaveBeenNthCalledWith(1, {
        ...userData,
        id: expect.any(String),
        accountId: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      })
      expect(userDBServiceMock.create).toHaveBeenCalledTimes(2)
    })
  })
})

describe('#update', () => {
  const subject = new UserDomain(requestEventMock)
  const userId = faker.string.uuid()
  const userData = userFixture.build()
  const inputs = {
    displayName: faker.person.firstName(),
    bio: faker.lorem.sentence(),
  }

  beforeEach(() => {
    userDBServiceMock.update.mockResolvedValue(userData)
    kvServiceMock.user.get.mockResolvedValue(userData)
  })

  test('userDB.updateがコールされ、KVのログインユーザー情報が更新されること', async () => {
    await subject.update(userId, inputs)

    expect(userDBServiceMock.update).toHaveBeenCalledWith(userId, inputs)
    expect(kvServiceMock.user.put).toHaveBeenCalledWith({
      ...userData,
      ...inputs,
    })
  })
})

describe('#getByProfileIds', () => {
  beforeEach(() => {
    userDBServiceMock.getByGoogleProfileId.mockClear()
  })

  describe('profileIdキーにgoogleを指定した場合', () => {
    const subject = new UserDomain(requestEventMock)
    const googleProfileId = faker.string.uuid()
    test('userDB.getByGoogleProfileIdがコールされること', async () => {
      await subject.getByProfileIds({ googleProfileId })

      expect(userDBServiceMock.getByGoogleProfileId).toHaveBeenCalledWith(
        googleProfileId,
      )
    })
  })

  describe('profileIdキーにgoogleを指定しない場合', () => {
    const subject = new UserDomain(requestEventMock)
    const otherProfileId = faker.string.uuid()
    test('userDB.getByGoogleProfileIdはコールされないこと', async () => {
      await subject.getByProfileIds({
        otherProfileId,
      } as unknown as Parameters<UserDomain['getByProfileIds']>[0])

      expect(userDBServiceMock.getByGoogleProfileId).not.toHaveBeenCalled()
    })
  })
})
