import { prisma } from '@/infra/persistence/prisma/client'

export class PrismaHelper {
  static async getLastEmailCodeForEmail (email: string): Promise<string | undefined> {
    const emailValidation = await prisma.emailValidation.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    })
    return emailValidation?.code
  }

  static async cleanup () {
    await prisma.emailValidation.deleteMany()
  }
}
