import { Prisma } from '@prisma/client'

type SanitizedPagination = {
  page: number
  pageSize: number
  skip: number
  take: number
}

export abstract class BasePrismaRepository {
  protected static readonly MAX_PAGE_SIZE = 100
  protected static readonly AUTHOR_SELECT = Prisma.validator<Prisma.UserSelect>()({
    id: true,
    name: true,
    email: true,
    createdAt: true,
    updatedAt: true,
  })

  protected static readonly INCLUDE_OPTIONS = {
    comments: { orderBy: { createdAt: 'desc' } },
    attachments: { orderBy: { createdAt: 'desc' } },
    author: { select: BasePrismaRepository.AUTHOR_SELECT },
  } as const

  protected sanitizePagination (page: number, pageSize: number): SanitizedPagination {
    const safePage = Math.max(1, page)
    const safePageSize = Math.min(Math.max(1, pageSize), BasePrismaRepository.MAX_PAGE_SIZE)
    return {
      page: safePage,
      pageSize: safePageSize,
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }
  }

  protected pickIncludes (requested: string[], keys: (keyof typeof BasePrismaRepository.INCLUDE_OPTIONS)[]) {
    const options = BasePrismaRepository.INCLUDE_OPTIONS
    return Object.fromEntries(
      keys.map(key => [key, requested.includes(key) ? options[key] : false])
    )
  }
}
