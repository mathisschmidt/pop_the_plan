import { fail } from '@sveltejs/kit';
import { parseCategories } from '#lib/domain/category.ts';
import { getServices } from '#lib/server/container.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const { auth, sessions, decks, rings } = await getServices();
	return {
		guestAccess: auth.guestAccess(),
		guestDevices: sessions.countActive('guest'),
		openDecks: decks.open(),
		pending: rings.pendingCounts()
	};
};

const field = (form: FormData, name: string) => String(form.get(name) ?? '');

/** Each form gets its own key so messages show next to the right form. */
export const actions: Actions = {
	decks: async ({ request }) => {
		const form = await request.formData();
		const open = (await getServices()).decks.setOpen(parseCategories(form.getAll('open')));
		return {
			decks: { message: open.length ? 'Saved.' : 'Saved. Every deck is closed for now.' }
		};
	},

	password: async ({ request, locals }) => {
		const form = await request.formData();
		const outcome = await (
			await getServices()
		).auth.changeAdminPassword({
			current: field(form, 'current'),
			next: field(form, 'next'),
			confirmation: field(form, 'confirmation'),
			currentSessionId: locals.session!.id
		});
		if (!outcome.ok) return fail(400, { password: { error: outcome.error } });
		return { password: { message: 'Password updated. Other devices were signed out.' } };
	},

	guest: async ({ request }) => {
		const form = await request.formData();
		const outcome = await (
			await getServices()
		).auth.setGuestAccess({ code: field(form, 'code'), hint: field(form, 'hint') });
		if (!outcome.ok) return fail(400, { guest: { error: outcome.error } });
		return { guest: { message: 'Saved. She will need the new code.' } };
	},

	guestSignOut: async () => {
		(await getServices()).sessions.invalidateRole('guest');
		return { guest: { message: 'She has been signed out everywhere.' } };
	},

	guestDisable: async () => {
		(await getServices()).auth.disableGuestAccess();
		return { guest: { message: 'Access closed.' } };
	}
};
