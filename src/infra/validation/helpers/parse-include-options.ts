import type { ForumIncludeOptions } from '@/shared/types/forum/include-option'

type IncludeKey = keyof ForumIncludeOptions

export function parseIncludeOptions (value?: string | null): ForumIncludeOptions {
  const isValidIncludeKey = (item: string): item is IncludeKey => {
    return ['comments', 'attachments', 'author'].includes(item)
  }
  if (!value) return {}
  return value.split(',')
    .map(s => s.trim())
    .reduce((acc: ForumIncludeOptions, item) => ({
      ...acc,
      [item]: isValidIncludeKey(item),
    }), {})
}
