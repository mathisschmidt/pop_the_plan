import { ringImageUrl } from '#lib/domain/ring.ts';
import { getServices } from '#lib/server/container.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { rings } = await getServices();
	return {
		rings: rings.list('pending').map((ring) => ({ id: ring.id, imageUrl: ringImageUrl(ring.id) })),
		// The admin can try the experience, but their swipes are never recorded.
		preview: locals.session?.role === 'admin'
	};
};
