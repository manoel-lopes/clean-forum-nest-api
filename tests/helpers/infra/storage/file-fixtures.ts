import sharp from 'sharp'

export type FileType = 'png' | 'jpeg'

const pixel = sharp({ create: { width: 1, height: 1, channels: 4, background: '#fff' } })

export const loadTestPng = () => pixel.clone().png().toBuffer()
export const loadTestJpeg = () => pixel.clone().jpeg().toBuffer()

const loaders: Record<FileType, () => Promise<Buffer>> = {
  png: loadTestPng,
  jpeg: loadTestJpeg,
}

export const loadTestFile = (type: FileType) => loaders[type]()
