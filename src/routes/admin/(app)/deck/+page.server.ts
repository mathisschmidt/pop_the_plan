import { fail, redirect } from '@sveltejs/kit';
import { isCategory } from '#lib/domain/category.ts';
import { safeAdminPath, setWorkingDeck } from '#lib/server/decks/working-deck.ts';
import type { Actions, PageServerLoad } from './$types';

// Only the header menu posts here; there is nothing to show.
export const load: PageServerLoad = () => redirect(303, '/admin');

export const actions: Actions = {
	default: async ({ request, cookies, locals }) => {
		const form = await request.formData();
		const deck = form.get('deck');
		if (!isCategory(deck)) return fail(400, { error: 'Unknown deck' });

		setWorkingDeck(cookies, locals.origin, deck);
		redirect(303, safeAdminPath(form.get('next')));
	}
};
