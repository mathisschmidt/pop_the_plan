import { getServices } from '#lib/server/container.ts';
import { readWorkingDeck } from '#lib/server/decks/working-deck.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const { auth, decks, rings } = await getServices();
	return {
		usingDefaultPassword: auth.isUsingDefaultPassword(),
		deck: readWorkingDeck(cookies),
		openDecks: decks.open(),
		pending: rings.pendingCounts()
	};
};
