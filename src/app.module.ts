import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './infra/persistence/prisma.module'
import { RepositoriesModule } from './infra/persistence/repositories/repositories.module'

@Module({
  imports: [PrismaModule, RepositoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
