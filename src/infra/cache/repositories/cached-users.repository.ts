import { Inject, Injectable } from '@nestjs/common'
import type { PaginationParams } from '@/core/domain/pagination-params'
import {
  type PaginatedUsers,
  type UpdateUserData,
  UsersRepository,
} from '@/domain/application/repositories/users.repository'
import { RedisCacheService } from '@/infra/cache/redis-cache.service'
import type { User } from '@/domain/enterprise/entities/user/user.entity'
import { BaseCachedRepository } from './base/base-cached.repository'

export const TypeOrmUsersRepositoryToken = Symbol('TypeOrmUsersRepositoryToken')

@Injectable()
export class CachedUsersRepository extends BaseCachedRepository implements UsersRepository {
  private readonly USER_TTL = 60 * 60
  private readonly USERS_LIST_TTL = 5 * 60
  private readonly userIdToEmail = new Map<string, string>()

  constructor (
    protected readonly cacheService: RedisCacheService,
    @Inject(TypeOrmUsersRepositoryToken)
    private readonly usersRepository: UsersRepository
  ) {
    super(cacheService)
  }

  async save (user: User): Promise<void> {
    await this.usersRepository.save(user)
    this.userIdToEmail.set(user.id, user.email)
    await Promise.all([
      this.setCache(this.getUserCacheKey(user.id), user, this.USER_TTL),
      this.setCache(this.getUserByEmailCacheKey(user.email), user, this.USER_TTL),
      this.invalidateCachePattern(this.getUsersListCachePattern()),
    ])
  }

  async update (userData: UpdateUserData): Promise<User> {
    const user = await this.usersRepository.update(userData)
    this.userIdToEmail.set(user.id, user.email)
    await Promise.all([
      this.setCache(this.getUserCacheKey(user.id), user, this.USER_TTL),
      this.setCache(this.getUserByEmailCacheKey(user.email), user, this.USER_TTL),
      this.invalidateCachePattern(this.getUsersListCachePattern()),
    ])
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
      await this.setCache(cacheKey, user, this.USER_TTL)
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
      await this.setCache(cacheKey, user, this.USER_TTL)
    }
    return user
  }

  async findMany (paginationParams: PaginationParams): Promise<PaginatedUsers> {
    const { page = 1, pageSize = 10 } = paginationParams
    const cacheKey = this.getUsersListCacheKey(page, pageSize)
    const cached = await this.getFromCache<PaginatedUsers>(cacheKey)
    if (cached) return cached
    const users = await this.usersRepository.findMany(paginationParams)
    await this.setCache(cacheKey, users, this.USERS_LIST_TTL)
    return users
  }

  async delete (userId: string): Promise<void> {
    const email = this.userIdToEmail.get(userId)
    await this.usersRepository.delete(userId)
    const invalidations: Promise<void>[] = [
      this.invalidateCache(this.getUserCacheKey(userId)),
      this.invalidateCachePattern(this.getUsersListCachePattern()),
      this.invalidateCachePattern(this.getQuestionsByUserCachePattern(userId)),
    ]
    if (email) {
      invalidations.push(this.invalidateCache(this.getUserByEmailCacheKey(email)))
    }
    await Promise.all(invalidations)
    this.userIdToEmail.delete(userId)
  }

  private getUserCacheKey (id: string): string {
    return `user:${id}`
  }

  private getUserByEmailCacheKey (email: string): string {
    return `user:email:${email}`
  }

  private getUsersListCacheKey (page: number, size: number): string {
    return `users:list:page:${page}:size:${size}`
  }

  private getUsersListCachePattern (): string {
    return 'users:list:*'
  }

  private getQuestionsByUserCachePattern (userId: string): string {
    return `questions:user:${userId}:*`
  }
}
