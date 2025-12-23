import { Primitives } from './primitives'

export type Props<T> = Omit<Primitives<T>, 'id' | 'createdAt' | 'updatedAt'>
