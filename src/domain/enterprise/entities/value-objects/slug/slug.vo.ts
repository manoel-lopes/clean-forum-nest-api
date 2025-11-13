export class Slug {
  private constructor (readonly value: string) {}

  static create (text: string): Slug {
    const slugText = text
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    return new Slug(slugText)
  }
}
