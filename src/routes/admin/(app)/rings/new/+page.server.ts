import { fail } from '@sveltejs/kit';
import { getServices } from '#lib/server/container.ts';
import { InvalidImageError } from '#lib/server/rings/image-processor.ts';
import type { Actions } from './$types';

const optionalUrl = (value: FormDataEntryValue | null) => {
	if (typeof value !== 'string' || !value) return null;
	return URL.canParse(value) ? value : null;
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const image = form.get('image');
		if (!(image instanceof File) || image.size === 0) {
			return fail(400, { error: 'Pick a picture first' });
		}

		try {
			const { rings } = await getServices();
			await rings.add(Buffer.from(await image.arrayBuffer()), optionalUrl(form.get('sourceUrl')));
		} catch (err) {
			if (err instanceof InvalidImageError) return fail(400, { error: err.message });
			throw err;
		}
		return { added: true };
	}
};
