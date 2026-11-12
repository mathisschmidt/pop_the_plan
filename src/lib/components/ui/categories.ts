import type { Category } from '#lib/domain/category.ts';
import type { IconName } from './Icon.svelte';

export const CATEGORY_ICON: Record<Category, IconName> = {
	ring: 'ring',
	dress: 'dress',
	shoes: 'shoes'
};
