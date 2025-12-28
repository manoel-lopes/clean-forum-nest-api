import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/application/pagination-params'
import { PaginatedUsers, UpdateUserData, UsersRepository } from '@/domain/application/repositories/users.repository'
import { RedisCacheService } from '@/infra/persistence/repositories/cache/redis-cache.service'
import type { User, UserProps } from '@/domain/enterprise/entities/user.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

@Injectable()
export class CachedUsersRepository
  extends BaseCachedRepository
  implements UsersRepository {
  private readonly USERS_TTL = 3600
  private readonly USERS_LIST_TTL = 1800
  private readonly userIdToEmail = new Map<string, string>()

  constructor (
    protected readonly redis: RedisCacheService,
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository
  ) {
    super(redis)
  }

  async create (userData: UserProps): Promise<User> {
    const user = await this.usersRepository.create(userData)
    this.userIdToEmail.set(user.id, user.email)
    await this.setCache(this.getUserCacheKey(user.id), user, this.USERS_TTL)
    await this.setCache(this.getUserByEmailCacheKey(user.email), user, this.USERS_TTL)
    await this.invalidateCachePattern(this.getUsersListCachePattern())
    return user
  }

  async update ({ where, data }: UpdateUserData): Promise<User> {
    const user = await this.usersRepository.update({ where, data })
    this.userIdToEmail.set(user.id, user.email)
    await this.setCache(this.getUserCacheKey(user.id), user, this.USERS_TTL)
    await this.setCache(this.getUserByEmailCacheKey(user.email), user, this.USERS_TTL)
    await this.invalidateCachePattern(this.getUsersListCachePattern())
    return user
  }

  async findById (userId: string): Promise<User | null> {
    const cacheKey = this.getUserCacheKey(userId)
    const cached = await this.getFromCache<User>(cacheKey)
    if (cached) {
      this.userIdToEmail.set(cached.id, cached.email)
      return cached
    }
    const user = await this.usersRepository.findById(userId)
    if (user) {
      this.userIdToEmail.set(user.id, user.email)
      await this.setCache(cacheKey, user, this.USERS_TTL)
    }
    return user
  }

  async findByEmail (email: string): Promise<User | null> {
    const cacheKey = this.getUserByEmailCacheKey(email)
    const cached = await this.getFromCache<User>(cacheKey)
    if (cached) {
      this.userIdToEmail.set(cached.id, cached.email)
      return cached
    }
    const user = await this.usersRepository.findByEmail(email)
    if (user) {
      this.userIdToEmail.set(user.id, user.email)
      await this.setCache(cacheKey, user, this.USERS_TTL)
    }
    return user
  }

  async findMany (params: PaginationParams): Promise<PaginatedUsers> {
    const { page = 1, pageSize = 10 } = params
    const cacheKey = this.getUsersListCacheKey(page, pageSize)
    const cached = await this.getFromCache<PaginatedUsers>(cacheKey)
    if (cached) return cached
    const users = await this.usersRepository.findMany(params)
    await this.setCache(cacheKey, users, this.USERS_LIST_TTL)
    return users
  }

  async delete (userId: string): Promise<void> {
    const email = this.userIdToEmail.get(userId)
    await this.usersRepository.delete(userId)
    await this.invalidateCache(this.getUserCacheKey(userId))
    if (email) await this.invalidateCache(this.getUserByEmailCacheKey(email))
    await this.invalidateCachePattern(this.getUsersListCachePattern())
    this.userIdToEmail.delete(userId)
  }

  private getUserCacheKey (id: string) {
    return `user:${id}`
  }

  private getUserByEmailCacheKey (email: string) {
    return `user:email:${email}`
  }

  private getUsersListCacheKey (page: number, size: number) {
    return `users:list:page:${page}:size:${size}`
  }

  private getUsersListCachePattern () {
    return 'users:list:*'
  }
}
