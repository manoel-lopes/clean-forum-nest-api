import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { EnvService } from '@/infra/env/env.service'
import {
  AnswerEntity,
  AttachmentEntity,
  CommentEntity,
  EmailValidationEntity,
  QuestionEntity,
  RefreshTokenEntity,
  UserEntity,
} from './entities'

const entities = [
  UserEntity,
  QuestionEntity,
  AnswerEntity,
  CommentEntity,
  AttachmentEntity,
  RefreshTokenEntity,
  EmailValidationEntity,
]

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        type: 'postgres',
        url: envService.get('DATABASE_URL'),
        entities,
        synchronize: false,
        logging: envService.get('NODE_ENV') === 'development',
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  exports: [TypeOrmModule],
})
export class TypeOrmPersistenceModule {}
