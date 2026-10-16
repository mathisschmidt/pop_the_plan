import { MAX_INPUT_BYTES } from './image-processor';

export class RemoteImageError extends Error {}

const TIMEOUT_MS = 10_000;
// Many sites (shops, CDNs, Wikimedia) reject requests without a User-Agent.
const USER_AGENT = 'Mozilla/5.0 (compatible; PopThePlan/1.0; image import)';

/**
 * Downloads a picture on the admin's behalf, so the browser can crop it
 * without CORS issues (a canvas cannot export a cross-origin image).
 *
 * Only reachable by the authenticated admin. It still refuses non-HTTP(S)
 * schemes, non-image responses and oversized bodies.
 */
export async function fetchRemoteImage(
	rawUrl: string,
	fetchFn: typeof fetch = fetch
): Promise<{ data: Uint8Array; contentType: string }> {
	let url: URL;
	try {
		url = new URL(rawUrl);
	} catch {
		throw new RemoteImageError('This is not a valid URL');
	}
	if (url.protocol !== 'https:' && url.protocol !== 'http:') {
		throw new RemoteImageError('Only http(s) links are supported');
	}

	let response: Response;
	try {
		response = await fetchFn(url, {
			signal: AbortSignal.timeout(TIMEOUT_MS),
			headers: { accept: 'image/*', 'user-agent': USER_AGENT },
			redirect: 'follow'
		});
	} catch {
		throw new RemoteImageError('Could not reach this URL');
	}

	if (!response.ok) throw new RemoteImageError(`The site answered ${response.status}`);

	const contentType = response.headers.get('content-type')?.split(';')[0].trim() ?? '';
	if (!contentType.startsWith('image/')) {
		throw new RemoteImageError('This link is not an image (try "copy image address")');
	}

	const declared = Number(response.headers.get('content-length') ?? 0);
	if (declared > MAX_INPUT_BYTES) throw new RemoteImageError('The image is too large');

	return { data: await readWithLimit(response, MAX_INPUT_BYTES), contentType };
}

async function readWithLimit(response: Response, limit: number): Promise<Uint8Array> {
	if (!response.body) throw new RemoteImageError('Empty response');

	const chunks: Uint8Array[] = [];
	let total = 0;
	for await (const chunk of response.body) {
		total += chunk.byteLength;
		if (total > limit) throw new RemoteImageError('The image is too large');
		chunks.push(chunk);
	}
	return Buffer.concat(chunks);
}
