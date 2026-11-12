import { redirect } from '@sveltejs/kit';
import { CATEGORIES } from '#lib/domain/category.ts';
import { ringImageUrl } from '#lib/domain/ring.ts';
import { getServices } from '#lib/server/container.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { category } = params;
	const { decks, rings } = await getServices();
	// The admin can try any deck, but their swipes are never recorded.
	const preview = locals.session?.role === 'admin';

	const open = decks.open();
	if (!preview && !open.includes(category)) redirect(303, '/swipe');

	const pending = rings.pendingCounts();
	return {
		category,
		pictures: rings
			.list(category, 'pending')
			.map((ring) => ({ id: ring.id, imageUrl: ringImageUrl(ring.id) })),
		// A closed deck previewed by the admin still shows up in the switch.
		decks: CATEGORIES.filter((c) => open.includes(c) || c === category).map((c) => ({
			category: c,
			pending: pending[c]
		})),
		preview
	};
};
