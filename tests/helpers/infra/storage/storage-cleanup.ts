import * as fs from 'node:fs/promises'
import * as path from 'node:path'

const UPLOADS_DIR = './uploads'

export async function deleteUploadedFile (key: string): Promise<void> {
  const filePath = path.join(UPLOADS_DIR, key)
  try {
    await fs.unlink(filePath)
  } catch {
    // File may not exist, ignore error
  }
}

export async function clearUploadsDirectory (): Promise<void> {
  try {
    const files = await fs.readdir(UPLOADS_DIR)
    await Promise.all(
      files.map((file) => fs.unlink(path.join(UPLOADS_DIR, file))),
    )
  } catch {
    // Directory may not exist, ignore error
  }
}
