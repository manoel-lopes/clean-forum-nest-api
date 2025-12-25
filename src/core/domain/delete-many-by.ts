export type DeleteManyBy<Field extends string> = {
  [K in `deleteManyBy${Capitalize<Field>}`]: (value: string) => Promise<void>
}
