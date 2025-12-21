import { CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { uuidv7 } from 'uuidv7'

export abstract class BaseEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  readonly id = uuidv7()

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt = new Date()

  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  readonly updatedAt: Date = new Date()
}
