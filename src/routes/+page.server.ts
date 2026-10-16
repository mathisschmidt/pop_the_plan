import { redirect } from '@sveltejs/kit';
import { homePath } from '#lib/server/auth/access.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	redirect(303, homePath(locals.session?.role ?? null));
};
