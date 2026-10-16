import { describe, expect, it } from 'vitest';
import { RemoteImageError, fetchRemoteImage } from './remote-image';

const respond = (body: BodyInit, headers: Record<string, string>, status = 200) =>
	(async () => new Response(body, { status, headers })) as unknown as typeof fetch;

describe('fetchRemoteImage', () => {
	it('returns the bytes of an image', async () => {
		const result = await fetchRemoteImage(
			'https://example.com/ring.jpg',
			respond(new Uint8Array([1, 2, 3]), { 'content-type': 'image/jpeg' })
		);
		expect(result.contentType).toBe('image/jpeg');
		expect([...result.data]).toEqual([1, 2, 3]);
	});

	it.each([
		['not a url', respond('', {})],
		['file:///etc/passwd', respond('', {})],
		['https://example.com/page', respond('<html>', { 'content-type': 'text/html' })],
		['https://example.com/404', respond('', { 'content-type': 'image/png' }, 404)]
	])('rejects %s', async (url, fetchFn) => {
		await expect(fetchRemoteImage(url, fetchFn)).rejects.toBeInstanceOf(RemoteImageError);
	});
});
