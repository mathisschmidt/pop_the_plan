import { fail } from '@sveltejs/kit';
import { isCategory } from '#lib/domain/category.ts';
import { parseLink } from '#lib/domain/ring.ts';
import { getServices } from '#lib/server/container.ts';
import { InvalidImageError } from '#lib/server/rings/image-processor.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const category = form.get('category');
		if (!isCategory(category)) return fail(400, { error: 'Pick what this picture is' });

		const image = form.get('image');
		if (!(image instanceof File) || image.size === 0) {
			return fail(400, { error: 'Pick a picture first' });
		}
		const link = parseLink(form.get('sourceUrl'));
		if (!link.ok) return fail(400, { error: link.error });

		try {
			const { rings } = await getServices();
			await rings.add(category, Buffer.from(await image.arrayBuffer()), link.value);
		} catch (err) {
			if (err instanceof InvalidImageError) return fail(400, { error: err.message });
			throw err;
		}
		return { added: true };
	}
};
