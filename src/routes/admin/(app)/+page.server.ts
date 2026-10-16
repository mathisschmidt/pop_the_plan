import { getServices } from '#lib/server/container.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { rings, auth, sessions } = await getServices();
	return {
		counts: rings.counts(),
		guestAccess: auth.guestAccess(),
		guestDevices: sessions.countActive('guest')
	};
};
