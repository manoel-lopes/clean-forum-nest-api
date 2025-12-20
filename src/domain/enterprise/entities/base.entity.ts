import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { uuidv7 } from 'uuidv7'

export abstract class BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt?: Date

  constructor (id?: string, createdAt?: Date, updatedAt?: Date) {
    this.id = id ?? uuidv7()
    this.createdAt = createdAt ?? new Date()
    this.updatedAt = updatedAt ?? new Date()
  }
}
