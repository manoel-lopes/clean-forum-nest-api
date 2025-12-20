import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { uuidv7 } from 'uuidv7'

export abstract class BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  readonly id: string

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  readonly updatedAt?: Date

  constructor (id?: string, createdAt?: Date, updatedAt?: Date) {
    this.id = id ?? uuidv7()
    this.createdAt = createdAt ?? new Date()
    this.updatedAt = updatedAt ?? new Date()
  }
}
