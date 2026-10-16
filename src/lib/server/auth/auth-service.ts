import {
	GUEST_CODE_MIN_LENGTH,
	GUEST_HINT_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
	normalizeGuestCode
} from '#lib/domain/auth.ts';
import { hashSecret, verifySecret } from '../security/password';
import type { SettingsRepository } from '../settings/settings-repository';
import type { SessionService } from './session-service';

export type Outcome = { ok: true } | { ok: false; error: string };

export interface GuestAccessStatus {
	enabled: boolean;
	hint: string | null;
}

export class AuthService {
	constructor(
		private readonly settings: SettingsRepository,
		private readonly sessions: SessionService
	) {}

	async verifyAdminPassword(password: string): Promise<boolean> {
		return verifySecret(password, this.settings.get().adminPasswordHash);
	}

	async verifyGuestCode(code: string): Promise<boolean> {
		const { guestCodeHash } = this.settings.get();
		if (!guestCodeHash) return false;
		return verifySecret(normalizeGuestCode(code), guestCodeHash);
	}

	isUsingDefaultPassword(): boolean {
		return this.settings.get().adminPasswordIsDefault;
	}

	guestAccess(): GuestAccessStatus {
		const { guestCodeHash, guestHint } = this.settings.get();
		return { enabled: guestCodeHash !== null, hint: guestHint };
	}

	async changeAdminPassword(input: {
		current: string;
		next: string;
		confirmation: string;
		currentSessionId: string;
	}): Promise<Outcome> {
		if (!(await this.verifyAdminPassword(input.current))) {
			return { ok: false, error: 'Current password is wrong' };
		}
		if (input.next.length < PASSWORD_MIN_LENGTH) {
			return { ok: false, error: `Use at least ${PASSWORD_MIN_LENGTH} characters` };
		}
		if (input.next !== input.confirmation) {
			return { ok: false, error: 'The two passwords do not match' };
		}

		this.settings.update({
			adminPasswordHash: await hashSecret(input.next),
			adminPasswordIsDefault: false
		});
		this.sessions.invalidateRole('admin', input.currentSessionId);
		return { ok: true };
	}

	/** Setting a new code signs her out everywhere, so the new code is required. */
	async setGuestAccess(input: { code: string; hint: string }): Promise<Outcome> {
		const code = normalizeGuestCode(input.code);
		const hint = input.hint.trim();

		if (code.length < GUEST_CODE_MIN_LENGTH) {
			return {
				ok: false,
				error: `The code needs at least ${GUEST_CODE_MIN_LENGTH} letters or digits`
			};
		}
		if (!hint) return { ok: false, error: 'Give her a sentence to guess the code' };
		if (hint.length > GUEST_HINT_MAX_LENGTH) {
			return { ok: false, error: `Keep the hint under ${GUEST_HINT_MAX_LENGTH} characters` };
		}

		this.settings.update({ guestCodeHash: await hashSecret(code), guestHint: hint });
		this.sessions.invalidateRole('guest');
		return { ok: true };
	}

	disableGuestAccess(): void {
		this.settings.update({ guestCodeHash: null, guestHint: null });
		this.sessions.invalidateRole('guest');
	}
}
