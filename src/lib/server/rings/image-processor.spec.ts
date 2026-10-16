import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { RING_IMAGE } from '#lib/domain/ring.ts';
import { InvalidImageError, normalizeRingImage } from './image-processor';

describe('normalizeRingImage', () => {
	it('outputs the canonical size and format whatever the input', async () => {
		const input = await sharp({
			create: { width: 640, height: 480, channels: 3, background: '#d4af37' }
		})
			.png()
			.toBuffer();

		const meta = await sharp(await normalizeRingImage(input)).metadata();
		expect(meta).toMatchObject({
			format: 'webp',
			width: RING_IMAGE.width,
			height: RING_IMAGE.height
		});
	});

	it('rejects non images', async () => {
		await expect(normalizeRingImage(Buffer.from('hello'))).rejects.toBeInstanceOf(
			InvalidImageError
		);
		await expect(normalizeRingImage(Buffer.alloc(0))).rejects.toBeInstanceOf(InvalidImageError);
	});
});
