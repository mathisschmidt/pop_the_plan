import { redirect } from '@sveltejs/kit';
import { getServices } from '#lib/server/container.ts';
import type { PageServerLoad } from './$types';

/** Her home: lands on the first open deck that still has something to swipe. */
export const load: PageServerLoad = async ({ locals }) => {
	const { decks, rings } = await getServices();
	const open = decks.open();
	const pending = rings.pendingCounts();
	const preview = locals.session?.role === 'admin';

	const target = open.find((c) => pending[c] > 0) ?? open[0] ?? (preview ? 'ring' : undefined);
	if (target) redirect(303, `/swipe/${target}`);

	// Every deck is closed: nothing to show her.
	return { preview };
};
