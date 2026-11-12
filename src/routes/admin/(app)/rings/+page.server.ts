import { fail } from '@sveltejs/kit';
import { isCategory } from '#lib/domain/category.ts';
import { isRingStatus, ringImageUrl } from '#lib/domain/ring.ts';
import { getServices } from '#lib/server/container.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const deckParam = url.searchParams.get('deck');
	const statusParam = url.searchParams.get('status');
	const deck = isCategory(deckParam) ? deckParam : 'ring';
	const status = isRingStatus(statusParam) ? statusParam : 'pending';
	const { rings, decks } = await getServices();

	return {
		deck,
		status,
		openDecks: decks.open(),
		counts: rings.counts(deck),
		rings: rings.list(deck, status).map((ring) => ({
			id: ring.id,
			imageUrl: ringImageUrl(ring.id),
			reason: ring.reason,
			sourceUrl: ring.sourceUrl,
			decidedAt: ring.decidedAt
		}))
	};
};

const ringId = async (request: Request) => String((await request.formData()).get('id') ?? '');

export const actions: Actions = {
	delete: async ({ request }) => {
		const { rings } = await getServices();
		if (!(await rings.remove(await ringId(request)))) return fail(404, { error: 'Not found' });
		return { message: 'Deleted' };
	},
	reset: async ({ request }) => {
		const { rings } = await getServices();
		if (!rings.resetVerdict(await ringId(request))) return fail(404, { error: 'Not found' });
		return { message: 'Back in her pile' };
	}
};
