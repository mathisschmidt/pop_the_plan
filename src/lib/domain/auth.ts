export const ROLES = ['admin', 'guest'] as const;
export type Role = (typeof ROLES)[number];

export const PASSWORD_MIN_LENGTH = 8;
export const GUEST_CODE_MIN_LENGTH = 3;
export const GUEST_HINT_MAX_LENGTH = 200;

/**
 * The guest code is meant to be *guessed* from a hint, so we are forgiving:
 * case, accents, punctuation and extra spaces are ignored ("Café de Flore!" == "cafe de flore").
 */
export function normalizeGuestCode(raw: string): string {
	return raw
		.normalize('NFKD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();
}
