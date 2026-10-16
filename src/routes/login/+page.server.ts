import { redirect } from '@sveltejs/kit';
import { homePath } from '#lib/server/auth/access.ts';
import { login } from '#lib/server/auth/login.ts';
import { getServices } from '#lib/server/container.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.session) redirect(303, homePath(locals.session.role));
	return { access: (await getServices()).auth.guestAccess() };
};

export const actions: Actions = {
	default: async (event) => {
		const services = await getServices();
		const code = String((await event.request.formData()).get('code') ?? '');
		return login(event, services, 'guest', () => services.auth.verifyGuestCode(code));
	}
};
