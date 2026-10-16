import sharp from 'sharp';
import { RING_IMAGE } from '#lib/domain/ring.ts';

export const MAX_INPUT_BYTES = 15 * 1024 * 1024;

export class InvalidImageError extends Error {}

/**
 * Normalises any incoming picture to the canonical ring format.
 * The browser already cropped it, but the server is the source of truth:
 * whatever arrives, what we store is a metadata-free 1080x1350 WebP.
 */
export async function normalizeRingImage(input: Buffer): Promise<Buffer> {
	if (input.byteLength === 0) throw new InvalidImageError('The file is empty');
	if (input.byteLength > MAX_INPUT_BYTES) throw new InvalidImageError('The file is too large');

	try {
		return await sharp(input, { limitInputPixels: 50_000_000 })
			.autoOrient()
			.resize(RING_IMAGE.width, RING_IMAGE.height, { fit: 'cover', position: 'centre' })
			.webp({ quality: 85 })
			.toBuffer();
	} catch {
		throw new InvalidImageError('This file is not a supported image');
	}
}
