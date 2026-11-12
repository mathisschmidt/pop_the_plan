import { getServices } from '#lib/server/container.ts';
import { readWorkingDeck } from '#lib/server/decks/working-deck.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const { rings, auth, sessions } = await getServices();
	return {
		counts: rings.counts(readWorkingDeck(cookies)),
		guestAccess: auth.guestAccess(),
		guestDevices: sessions.countActive('guest')
	};
};
