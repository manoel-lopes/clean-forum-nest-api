import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { EnvModule } from '@/infra/env/env.module'
import { EnvService } from '@/infra/env/env.service'
import { BcryptPasswordHasher } from './implementations/bcrypt-password-hasher'
import { PasswordHasherStub } from './stubs/password-hasher.stub'

export const PASSWORD_HASHER = Symbol('PasswordHasher')

const passwordHasherProviders: Record<string, new () => BcryptPasswordHasher | PasswordHasherStub> = {
  test: PasswordHasherStub,
  development: BcryptPasswordHasher,
  production: BcryptPasswordHasher,
}

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
      useFactory: (envService: EnvService) => {
        const env = envService.get('NODE_ENV')
        const PasswordHasherClass = passwordHasherProviders[env] || BcryptPasswordHasher
        return new PasswordHasherClass()
      },
      inject: [EnvService],
    },
  ],
  exports: [PASSWORD_HASHER, JwtModule],
})
export class SecurityModule {}
