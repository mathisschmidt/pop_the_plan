import { beforeEach, describe, expect, it } from 'vitest';
import { SettingsRepository } from '../settings/settings-repository';
import { testDb } from '../testing/fixtures';
import { DeckService } from './deck-service';

describe('DeckService', () => {
	let settings: SettingsRepository;
	let decks: DeckService;

	beforeEach(() => {
		settings = new SettingsRepository(testDb());
		settings.initialize('hash');
		decks = new DeckService(settings);
	});

	it('opens only the ring deck on a fresh install', () => {
		expect(decks.open()).toEqual(['ring']);
		expect(decks.isOpen('ring')).toBe(true);
		expect(decks.isOpen('dress')).toBe(false);
	});

	it('stores the open decks in canonical order', () => {
		expect(decks.setOpen(['shoes', 'dress', 'shoes'])).toEqual(['dress', 'shoes']);
		expect(decks.open()).toEqual(['dress', 'shoes']);
		expect(decks.isOpen('ring')).toBe(false);
	});

	it('can close every deck', () => {
		decks.setOpen([]);
		expect(decks.open()).toEqual([]);
	});

	it('ignores unknown values left in the database', () => {
		settings.update({ openCategories: '["dress","hat"]' });
		expect(decks.open()).toEqual(['dress']);
	});
});
