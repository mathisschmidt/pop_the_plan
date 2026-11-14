import { error, type RequestHandler } from '@sveltejs/kit';
import { RemoteImageError, fetchRemoteImage } from './remote-image';

/**
 * Same-origin proxy so the cropper can use pictures found on other websites
 * (a canvas cannot export a cross-origin image). Mounted on the admin and on her side;
 * `hooks.server.ts` only lets signed-in users reach it.
 */
export const proxyRemoteImage: RequestHandler = async ({ url }) => {
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
