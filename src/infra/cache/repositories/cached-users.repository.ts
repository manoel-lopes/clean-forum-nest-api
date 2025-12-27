import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import {
  type PaginatedUsers,
  type UpdateUserData,
  UsersRepository,
} from '@/domain/application/repositories/users.repository'
import { CacheTTL } from '@/infra/cache/cache-ttl'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { User } from '@/domain/enterprise/entities/user.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmUsersRepositoryToken = Symbol('TypeOrmUsersRepositoryToken')

@Injectable()
export class CachedUsersRepository extends BaseCachedRepository implements UsersRepository {
  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmUsersRepositoryToken)
    private readonly usersRepository: UsersRepository
  ) {
    super(cacheService)
  }

  async save (user: User): Promise<void> {
    await this.usersRepository.save(user)
    await this.setCache(this.getUserById(user.id), user, CacheTTL.USER)
    await this.invalidateCachePattern(this.getUsersListPattern())
  }

  async update (userData: UpdateUserData): Promise<User> {
    const user = await this.usersRepository.update(userData)
    await this.setCache(this.getUserById(user.id), user, CacheTTL.USER)
    if (user.email) {
      await this.setCache(this.getUserByEmail(user.email), user, CacheTTL.USER)
    }
    await this.invalidateCachePattern(this.getUsersListPattern())
    return user
  }

  async findById (userId: string): Promise<User | null> {
    const cacheKey = this.getUserById(userId)
    const cached = await this.getFromCache<User>(cacheKey)
    if (cached) return cached
    const user = await this.usersRepository.findById(userId)
    if (user) await this.setCache(cacheKey, user, CacheTTL.USER)
    return user
  }

  async delete (userId: string): Promise<void> {
    const user = await this.usersRepository.findById(userId)
    await this.usersRepository.delete(userId)
    await this.invalidateCache(this.getUserById(userId))
    if (user?.email) {
      await this.invalidateCache(this.getUserByEmail(user.email))
    }
    await this.invalidateCachePattern(this.getUsersListPattern())
    await this.invalidateCachePattern(this.getQuestionsByUserPattern(userId))
  }

  async findByEmail (email: string): Promise<User | null> {
    const cacheKey = this.getUserByEmail(email)
    const cached = await this.getFromCache<User>(cacheKey)
    if (cached) return cached
    const user = await this.usersRepository.findByEmail(email)
    if (user) await this.setCache(cacheKey, user, CacheTTL.USER)
    return user
  }

  async findMany (paginationParams: PaginationParams): Promise<PaginatedUsers> {
    const { page = 1, pageSize = 10 } = paginationParams
    const cacheKey = this.getUsersList(page, pageSize)
    const cached = await this.getFromCache<PaginatedUsers>(cacheKey)
    if (cached) return cached
    const users = await this.usersRepository.findMany(paginationParams)
    if (users) await this.setCache(cacheKey, users, CacheTTL.USERS_LIST)
    return users
  }

  private getUserById (userId: string): string {
    return `user:${userId}`
  }

  private getUserByEmail (email: string): string {
    return `user:email:${email}`
  }

  private getUsersList (page: number, size: number): string {
    return `users:list:page:${page}:size:${size}`
  }

  private getUsersListPattern (): string {
    return 'users:list:*'
  }

  private getQuestionsByUserPattern (userId: string): string {
    return `questions:user:${userId}:*`
  }
}
