import { fail } from '@sveltejs/kit';
import { isRingStatus, ringImageUrl } from '#lib/domain/ring.ts';
import { getServices } from '#lib/server/container.ts';
import { readWorkingDeck } from '#lib/server/decks/working-deck.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const param = url.searchParams.get('status');
	const status = isRingStatus(param) ? param : 'pending';
	const deck = readWorkingDeck(cookies);
	const { rings } = await getServices();

	return {
		status,
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
