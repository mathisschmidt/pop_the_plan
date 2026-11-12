import { defineParams } from '@sveltejs/kit/params';
import { isCategory } from '#lib/domain/category.ts';

export const params = defineParams({
	category: (param) => (isCategory(param) ? param : undefined)
});
