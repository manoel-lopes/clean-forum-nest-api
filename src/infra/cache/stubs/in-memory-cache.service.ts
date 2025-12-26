import { Injectable } from '@nestjs/common'

@Injectable()
export class InMemoryCacheService {
  private readonly cache = new Map<string, { value: string; expiresAt: number | null }>()

  async get<T> (key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    if (!entry) {
      return null
    }
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return JSON.parse(entry.value) as T
  }

  async set<T> (key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null
    this.cache.set(key, { value: JSON.stringify(value), expiresAt })
  }

  async delete (key: string): Promise<void> {
    this.cache.delete(key)
  }

  async deletePattern (pattern: string): Promise<void> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  async exists (key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  clear (): void {
    this.cache.clear()
  }
}
