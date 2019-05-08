import sharp from 'sharp';

export async function resizeImage(content, toWidth, toHeight) {
  const multiplierReq = new RegExp(/\dx{1}$/g);
  const imageMetadata = await sharp(content).metadata();
  const width = multiplierReq.test(toWidth) ? imageMetadata.width * parseInt(toWidth, 10) : parseInt(toWidth, 10);

  return sharp(content).resize(width, toHeight).toBuffer();
}

export function toWebp(content) {
  return sharp(content).webp().toBuffer();
}

export async function toPlaceholder(content) {
  const imageMetadata = await sharp(content).metadata();
  const buffer = await sharp(content).resize(20).blur().toBuffer();
  const url = `data:image/${imageMetadata.format};base64,${buffer.toString('base64')}`;
  const aspectRatio = imageMetadata.width / imageMetadata.height;

  return {
    url,
    aspectRatio,
  };
}
