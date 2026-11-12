import { parseCategories, type Category } from '#lib/domain/category.ts';
import type { SettingsRepository } from '../settings/settings-repository';

/** Which decks she can see. The admin opens and closes them from Settings. */
export class DeckService {
	constructor(private readonly settings: SettingsRepository) {}

	open(): Category[] {
		let stored: unknown;
		try {
			stored = JSON.parse(this.settings.get().openCategories);
		} catch {
			return [];
		}
		return Array.isArray(stored) ? parseCategories(stored) : [];
	}

	isOpen(category: Category): boolean {
		return this.open().includes(category);
	}

	setOpen(categories: readonly Category[]): Category[] {
		const open = parseCategories(categories);
		this.settings.update({ openCategories: JSON.stringify(open) });
		return open;
	}
}
