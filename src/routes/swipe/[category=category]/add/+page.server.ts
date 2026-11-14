import { error, fail, redirect } from '@sveltejs/kit';
import { getServices } from '#lib/server/container.ts';
import { InvalidImageError } from '#lib/server/rings/image-processor.ts';
import type { Actions, PageServerLoad } from './$types';

const optionalUrl = (value: FormDataEntryValue | null) => {
	if (typeof value !== 'string' || !value) return null;
	return URL.canParse(value) ? value : null;
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const { decks } = await getServices();
	// The admin adds pictures from the dashboard; she can only add to an open deck.
	if (locals.session?.role !== 'guest' || !decks.open().includes(params.category)) {
		redirect(303, `/swipe/${params.category}`);
	}
	return { category: params.category };
};

export const actions: Actions = {
	default: async ({ params, request, locals }) => {
		if (locals.session?.role !== 'guest') error(403, 'Only she can add one she loves');

		const form = await request.formData();
		const image = form.get('image');
		if (!(image instanceof File) || image.size === 0) {
			return fail(400, { error: 'Pick a picture first' });
		}

		try {
			const { rings } = await getServices();
			const added = await rings.addFromHer(
				params.category,
				Buffer.from(await image.arrayBuffer()),
				optionalUrl(form.get('sourceUrl'))
			);
			if (!added) return fail(409, { error: 'This one is closed for now' });
		} catch (err) {
			if (err instanceof InvalidImageError) return fail(400, { error: err.message });
			throw err;
		}
		return { added: true };
	}
};
