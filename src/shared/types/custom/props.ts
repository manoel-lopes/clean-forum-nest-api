type PrimitiveKeys<T> = {
  [K in keyof T]: T[K] extends object | null | undefined
    ? T[K] extends Date | null | undefined
      ? K
      : never
    : K
}[keyof T]

export type Props<T> = Omit<Pick<T, PrimitiveKeys<T>>, 'id' | 'createdAt' | 'updatedAt'>
