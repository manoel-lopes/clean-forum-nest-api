import type { ForumIncludeOptions } from '@/shared/types/forum/include-option'

type IncludeKey = keyof ForumIncludeOptions

export function parseIncludesOptions (
  value?: string | null,
  includes: string[] = []
): ForumIncludeOptions {
  const isValidIncludeKey = (item: string): item is IncludeKey => includes.includes(item)
  if (!value) return {}
  return value.split(',')
    .reduce((acc: ForumIncludeOptions, item) => ({
      ...acc,
      [item]: isValidIncludeKey(item),
    }), {})
}
