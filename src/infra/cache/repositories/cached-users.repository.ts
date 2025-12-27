import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import type { PaginatedUsers, UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { User, UserProps } from '@/domain/enterprise/entities/user.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const PrismaUsersRepositoryToken = Symbol('PrismaUsersRepositoryToken')

@Injectable()
export class CachedUsersRepository
  extends BaseCachedRepository
  implements UsersRepository {
  private readonly cacheKeys = {
    user: (id: string) => `user:${id}`,
    userByEmail: (email: string) => `user:email:${email}`,
    usersList: (page: number, size: number) => `users:list:page:${page}:size:${size}`,
    usersListPattern: () => 'users:list:*',
  }

  constructor (
    cacheService: RedisCacheService,
    @Inject(PrismaUsersRepositoryToken)
    private readonly usersRepository: UsersRepository
  ) {
    super(cacheService)
  }

  async create (user: UserProps): Promise<User> {
    const createdUser = await this.usersRepository.create(user)
    await this.setCache(this.cacheKeys.user(createdUser.id), createdUser, CacheTTL.USER)
    await this.setCache(this.cacheKeys.userByEmail(createdUser.email), createdUser, CacheTTL.USER)
    await this.invalidateCachePattern(this.cacheKeys.usersListPattern())
    return createdUser
  }

  async update ({ where, data }: UpdateUserData): Promise<User> {
    const user = await this.usersRepository.update({ where, data })
    await this.setCache(this.cacheKeys.user(user.id), user, CacheTTL.USER)
    await this.setCache(this.cacheKeys.userByEmail(user.email), user, CacheTTL.USER)
    await this.invalidateCachePattern(this.cacheKeys.usersListPattern())
    return user
  }

  async findById (userId: string): Promise<User | null> {
    const cacheKey = this.cacheKeys.user(userId)
    const cached = await this.getFromCache<User>(cacheKey)
    if (cached) return cached
    const user = await this.usersRepository.findById(userId)
    if (user) await this.setCache(cacheKey, user, CacheTTL.USER)
    return user
  }

  async findByEmail (email: string): Promise<User | null> {
    const cacheKey = this.cacheKeys.userByEmail(email)
    const cached = await this.getFromCache<User>(cacheKey)
    if (cached) return cached
    const user = await this.usersRepository.findByEmail(email)
    if (user) await this.setCache(cacheKey, user, CacheTTL.USER)
    return user
  }

  async findMany (params: PaginationParams): Promise<PaginatedUsers> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.cacheKeys.usersList(page, pageSize)
    const cached = await this.getFromCache<PaginatedUsers>(cacheKey)
    if (cached) return cached
    const users = await this.usersRepository.findMany(params)
    await this.setCache(cacheKey, users, CacheTTL.USERS_LIST)
    return users
  }

  async delete (userId: string): Promise<void> {
    const user = await this.usersRepository.findById(userId)
    await this.usersRepository.delete(userId)
    await this.invalidateCache(this.cacheKeys.user(userId))
    if (user) await this.invalidateCache(this.cacheKeys.userByEmail(user.email))
    await this.invalidateCachePattern(this.cacheKeys.usersListPattern())
  }
}
