import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'
import { PasswordHasherStub } from './stubs/password-hasher.stub'

export const PASSWORD_HASHER = Symbol('PasswordHasher')

@Global()
@Module({
  imports: [
    EnvModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  providers: [
    {
      provide: PASSWORD_HASHER,
      useClass: PasswordHasherStub,
    },
  ],
  exports: [PASSWORD_HASHER, JwtModule],
})
export class SecurityModule {}
