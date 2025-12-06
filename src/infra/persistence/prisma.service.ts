import pg from 'pg'
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { createPrismaAdapter } from './prisma-client.factory'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: pg.Pool

  constructor () {
    const { adapter, pool } = createPrismaAdapter(process.env.DATABASE_URL ?? '')
    super({ adapter })
    this.pool = pool
  }

  async onModuleInit () {
    await this.$connect()
  }

  async onModuleDestroy () {
    await this.$disconnect()
    await this.pool.end()
  }
}
