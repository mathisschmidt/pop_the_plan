import { error } from '@sveltejs/kit';
import { RemoteImageError, fetchRemoteImage } from '#lib/server/rings/remote-image.ts';
import type { RequestHandler } from './$types';

/** Same-origin proxy so the cropper can use pictures found on other websites. */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const { data, contentType } = await fetchRemoteImage(url.searchParams.get('url') ?? '');
		return new Response(new Uint8Array(data), {
			headers: { 'Content-Type': contentType, 'Cache-Control': 'no-store' }
		});
	} catch (err) {
		if (err instanceof RemoteImageError) error(400, err.message);
		throw err;
	}
};
