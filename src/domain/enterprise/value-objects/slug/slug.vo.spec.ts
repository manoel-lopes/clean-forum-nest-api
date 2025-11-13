import { Slug } from './slug.vo'

describe('Slug', () => {
  it('should create a slug from a simple text', () => {
    const slug = Slug.create('Hello World')
    expect(slug.value).toBe('hello-world')
  })

  it('should create a slug from text with special characters', () => {
    const slug = Slug.create('Hello, World! How are you?')
    expect(slug.value).toBe('hello-world-how-are-you')
  })

  it('should create a slug from text with accented characters', () => {
    const slug = Slug.create('Olá Mundo! Como está você?')
    expect(slug.value).toBe('ola-mundo-como-esta-voce')
  })

  it('should create a slug from text with multiple spaces', () => {
    const slug = Slug.create('Hello    World    Test')
    expect(slug.value).toBe('hello-world-test')
  })

  it('should create a slug from text with leading and trailing spaces', () => {
    const slug = Slug.create('   Hello World   ')
    expect(slug.value).toBe('hello-world')
  })

  it('should create a slug from text with leading and trailing hyphens', () => {
    const slug = Slug.create('---Hello World---')
    expect(slug.value).toBe('hello-world')
  })

  it('should create a slug from text with numbers', () => {
    const slug = Slug.create('Hello World 123')
    expect(slug.value).toBe('hello-world-123')
  })

  it('should create a slug from text with underscores', () => {
    const slug = Slug.create('Hello_World_Test')
    expect(slug.value).toBe('hello-world-test')
  })

  it('should create a slug from text with mixed case', () => {
    const slug = Slug.create('HeLLo WoRLd')
    expect(slug.value).toBe('hello-world')
  })

  it('should create a slug from text with multiple consecutive hyphens', () => {
    const slug = Slug.create('Hello---World')
    expect(slug.value).toBe('hello-world')
  })

  it('should create a slug from text with apostrophes', () => {
    const slug = Slug.create("It's a wonderful day")
    expect(slug.value).toBe('it-s-a-wonderful-day')
  })

  it('should create a slug from text with dots', () => {
    const slug = Slug.create('Hello.World.Test')
    expect(slug.value).toBe('hello-world-test')
  })

  it('should create a slug from text with slashes', () => {
    const slug = Slug.create('Hello/World/Test')
    expect(slug.value).toBe('hello-world-test')
  })

  it('should create a slug from text with parentheses', () => {
    const slug = Slug.create('Hello (World) Test')
    expect(slug.value).toBe('hello-world-test')
  })

  it('should create a slug from text with brackets', () => {
    const slug = Slug.create('Hello [World] Test')
    expect(slug.value).toBe('hello-world-test')
  })

  it('should create a slug from an empty string', () => {
    const slug = Slug.create('')
    expect(slug.value).toBe('')
  })

  it('should create a slug from text with only special characters', () => {
    const slug = Slug.create('!@#$%^&*()')
    expect(slug.value).toBe('')
  })
})
