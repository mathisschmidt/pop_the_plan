import { fail } from '@sveltejs/kit';
import { isCategory } from '#lib/domain/category.ts';
import { getServices } from '#lib/server/container.ts';
import { InvalidImageError } from '#lib/server/rings/image-processor.ts';
import type { Actions, PageServerLoad } from './$types';

const optionalUrl = (value: FormDataEntryValue | null) => {
	if (typeof value !== 'string' || !value) return null;
	return URL.canParse(value) ? value : null;
};

export const load: PageServerLoad = ({ url }) => {
	const param = url.searchParams.get('deck');
	return { deck: isCategory(param) ? param : 'ring' };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const category = form.get('category');
		if (!isCategory(category)) return fail(400, { error: 'Pick what this picture is' });

		const image = form.get('image');
		if (!(image instanceof File) || image.size === 0) {
			return fail(400, { error: 'Pick a picture first' });
		}

		try {
			const { rings } = await getServices();
			await rings.add(
				category,
				Buffer.from(await image.arrayBuffer()),
				optionalUrl(form.get('sourceUrl'))
			);
		} catch (err) {
			if (err instanceof InvalidImageError) return fail(400, { error: err.message });
			throw err;
		}
		return { added: true };
	}
};
