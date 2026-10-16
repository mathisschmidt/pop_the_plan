/**
 * Best-effort localStorage for per-device conveniences (e.g. "tutorial already seen").
 * Storage can be unavailable (private mode, blocked site data): never throw, and never
 * keep anything here that must persist.
 */
export const localFlag = {
	get(key: string): boolean {
		try {
			return localStorage.getItem(key) === '1';
		} catch {
			return false;
		}
	},
	set(key: string): void {
		try {
			localStorage.setItem(key, '1');
		} catch {
			// Not critical: worst case she sees the tutorial again.
		}
	}
};
