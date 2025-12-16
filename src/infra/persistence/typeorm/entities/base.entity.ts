import { BeforeInsert, BeforeUpdate, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { uuidv7 } from 'uuidv7'

export abstract class BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @BeforeInsert()
  generateId (): void {
    if (!this.id) {
      this.id = uuidv7()
    }
    this.createdAt = this.createdAt || new Date()
    this.updatedAt = new Date()
  }

  @BeforeUpdate()
  updateTimestamp (): void {
    this.updatedAt = new Date()
  }
}
