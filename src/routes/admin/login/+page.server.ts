import { redirect } from '@sveltejs/kit';
import { login } from '#lib/server/auth/login.ts';
import { getServices } from '#lib/server/container.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.session?.role === 'admin') redirect(303, '/admin');
};

export const actions: Actions = {
	default: async (event) => {
		const services = await getServices();
		const password = String((await event.request.formData()).get('password') ?? '');
		return login(event, services, 'admin', () => services.auth.verifyAdminPassword(password));
	}
};
