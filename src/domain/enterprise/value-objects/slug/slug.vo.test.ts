import { Slug } from './slug.vo'

describe('Slug', () => {
  it('should create a slug from simple text', () => {
    const slug = Slug.create('Hello World')
    expect(slug.value).toBe('hello-world')
  })

  it('should normalize accented characters', () => {
    const slug = Slug.create('Olá Mundo! Como está você?')
    expect(slug.value).toBe('ola-mundo-como-esta-voce')
  })

  it('should replace special characters with hyphens', () => {
    expect(Slug.create('Hello, World!').value).toBe('hello-world')
    expect(Slug.create('Hello.World').value).toBe('hello-world')
    expect(Slug.create('Hello/World').value).toBe('hello-world')
    expect(Slug.create('Hello_World').value).toBe('hello-world')
  })

  it('should collapse multiple separators into single hyphen', () => {
    expect(Slug.create('Hello    World').value).toBe('hello-world')
    expect(Slug.create('Hello---World').value).toBe('hello-world')
  })

  it('should remove leading and trailing hyphens', () => {
    expect(Slug.create('   Hello World   ').value).toBe('hello-world')
    expect(Slug.create('---Hello World---').value).toBe('hello-world')
  })

  it('should preserve numbers', () => {
    const slug = Slug.create('Hello World 123')
    expect(slug.value).toBe('hello-world-123')
  })

  it('should handle edge cases', () => {
    expect(Slug.create('').value).toBe('')
    expect(Slug.create('!@#$%^&*()').value).toBe('')
  })
})
