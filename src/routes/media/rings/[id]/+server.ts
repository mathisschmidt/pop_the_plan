import { error } from '@sveltejs/kit';
import { RING_IMAGE } from '#lib/domain/ring.ts';
import { getServices } from '#lib/server/container.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const image = await (await getServices()).rings.readImage(params.id);
	if (!image) error(404, 'Not found');

	return new Response(new Uint8Array(image), {
		headers: {
			'Content-Type': RING_IMAGE.mimeType,
			// Ids are never reused, so the bytes behind a URL never change.
			'Cache-Control': 'private, max-age=31536000, immutable'
		}
	});
};
