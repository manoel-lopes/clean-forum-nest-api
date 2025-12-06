export function parseIncludeOptions<T extends string> (
  value: string | null | undefined,
  options: T[]
): T[] | undefined {
  if (!value) return
  const items = value.includes(',') ? value.split(',').map(item => item.trim()) : [value]
  return items.filter((item): item is T => options.some(option => option === item)
  )
}
