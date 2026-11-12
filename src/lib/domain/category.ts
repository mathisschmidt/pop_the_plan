/**
 * Decks she can swipe: the ring, and the outfit picked for her. Shared by server and client,
 * free of any runtime dependency. Keep in sync with the CHECK constraints in the DB schema.
 *
 * Wording stays deliberately vague: nothing here may hint at a special day.
 */
export const CATEGORIES = ['ring', 'dress', 'shoes'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Decks open to her on a fresh install. */
export const DEFAULT_OPEN_CATEGORIES: readonly Category[] = ['ring'];

export interface CategoryMeta {
	/** Short label for tabs and pickers. */
	label: string;
	/** Heading of the admin gallery. */
	title: string;
	/** Heading of the admin "add" page. */
	addTitle: string;
	/** "1 ring left" / "3 rings left". */
	unit: { one: string; other: string };
	/** First words she reads when the deck opens. */
	intro: string;
	/** Quick chips in the "Maybe, but…" sheet. */
	suggestions: readonly string[];
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
	ring: {
		label: 'Ring',
		title: 'Rings',
		addTitle: 'Add a ring',
		unit: { one: 'ring', other: 'rings' },
		intro:
			'A few rings are waiting for you. Tell me honestly what you think of each one, there is no wrong answer.',
		suggestions: [
			'Stone too big',
			'Stone too small',
			'Not my metal',
			'Too flashy',
			'Band too thick'
		]
	},
	dress: {
		label: 'Dress',
		title: 'Dresses',
		addTitle: 'Add a dress',
		unit: { one: 'dress', other: 'dresses' },
		intro:
			'I picked a few dresses I would love to see you in. Tell me honestly what you think of each one.',
		suggestions: ['Not my colour', 'Too formal', 'Too casual', 'Neckline', 'Length', 'Fabric']
	},
	shoes: {
		label: 'Shoes',
		title: 'Shoes',
		addTitle: 'Add shoes',
		unit: { one: 'pair', other: 'pairs' },
		intro: 'A few pairs of shoes to go with it. Be honest, comfort counts too.',
		suggestions: ['Heel too high', 'Heel too low', 'Not comfy', 'Not my colour', 'Too flashy']
	}
};

export function isCategory(value: unknown): value is Category {
	return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value);
}

/** Keeps known categories only, without duplicates, in canonical order. */
export function parseCategories(values: readonly unknown[]): Category[] {
	return CATEGORIES.filter((category) => values.includes(category));
}

export function countLabel(category: Category, count: number): string {
	const { unit } = CATEGORY_META[category];
	return `${count} ${count === 1 ? unit.one : unit.other}`;
}
