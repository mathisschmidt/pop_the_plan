import { isCategory } from '#lib/domain/category.ts';
import { getServices } from '#lib/server/container.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const param = url.searchParams.get('deck');
	const deck = isCategory(param) ? param : 'ring';
	const { rings, decks, auth, sessions } = await getServices();
	return {
		deck,
		openDecks: decks.open(),
		counts: rings.counts(deck),
		guestAccess: auth.guestAccess(),
		guestDevices: sessions.countActive('guest')
	};
};
