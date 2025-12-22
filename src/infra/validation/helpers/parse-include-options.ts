import type { ForumIncludeOptions } from '@/shared/types/forum/include-option'

type IncludeKey = keyof ForumIncludeOptions

function isValidIncludeKey (item: string): item is IncludeKey {
  return item === 'comments' || item === 'attachments' || item === 'author'
}

export function parseIncludeOptions (value: string | null | undefined): ForumIncludeOptions {
  if (!value) return {}
  const result: ForumIncludeOptions = {}
  for (const item of value.split(',').map(s => s.trim())) {
    if (isValidIncludeKey(item)) {
      result[item] = true
    }
  }
  return result
}
