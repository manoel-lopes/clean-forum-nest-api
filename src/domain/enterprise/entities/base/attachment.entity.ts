import { Column, Entity, TableInheritance } from 'typeorm'
import { Props } from '@/shared/types/custom/props'
import { BaseEntity } from './base.entity'

export type AttachmentProps = Props<BaseAttachment>

@Entity('attachments')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class BaseAttachment extends BaseEntity {
  @Column({ type: 'text' })
  readonly title: string

  @Column({ type: 'text' })
  readonly url: string

  protected constructor (props: AttachmentProps) {
    super()
    Object.assign(this, props)
  }
}
