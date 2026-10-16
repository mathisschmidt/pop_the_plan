import { beforeEach, describe, expect, it } from 'vitest';
import { hashSecret } from '../security/password';
import { SettingsRepository } from '../settings/settings-repository';
import { testDb } from '../testing/fixtures';
import { AuthService } from './auth-service';
import { SessionService } from './session-service';

describe('AuthService', () => {
	let auth: AuthService;
	let sessions: SessionService;

	beforeEach(async () => {
		const db = testDb();
		const settings = new SettingsRepository(db);
		settings.initialize(await hashSecret('default-pass'));
		sessions = new SessionService(db);
		auth = new AuthService(settings, sessions);
	});

	it('starts with the default password flagged', async () => {
		expect(await auth.verifyAdminPassword('default-pass')).toBe(true);
		expect(auth.isUsingDefaultPassword()).toBe(true);
	});

	it('changes the password and signs out the other admin sessions', async () => {
		const current = sessions.create('admin').session;
		const other = sessions.create('admin');

		const outcome = await auth.changeAdminPassword({
			current: 'default-pass',
			next: 'brand-new-pass',
			confirmation: 'brand-new-pass',
			currentSessionId: current.id
		});

		expect(outcome).toEqual({ ok: true });
		expect(await auth.verifyAdminPassword('brand-new-pass')).toBe(true);
		expect(auth.isUsingDefaultPassword()).toBe(false);
		expect(sessions.validate(other.token)).toBeNull();
		expect(sessions.countActive('admin')).toBe(1);
	});

	it('refuses a wrong current password or a mismatch', async () => {
		const base = { next: 'brand-new-pass', currentSessionId: 'x' };
		expect(
			(await auth.changeAdminPassword({ ...base, current: 'nope', confirmation: base.next })).ok
		).toBe(false);
		expect(
			(await auth.changeAdminPassword({ ...base, current: 'default-pass', confirmation: 'other' }))
				.ok
		).toBe(false);
	});

	it('guest code is forgiving and resetting it signs her out', async () => {
		expect(auth.guestAccess().enabled).toBe(false);
		expect(await auth.verifyGuestCode('anything')).toBe(false);

		await auth.setGuestAccess({ code: 'Café de Flore', hint: 'Our first date?' });
		const guest = sessions.create('guest');

		expect(auth.guestAccess()).toEqual({ enabled: true, hint: 'Our first date?' });
		expect(await auth.verifyGuestCode('  cafe DE flore! ')).toBe(true);
		expect(await auth.verifyGuestCode('cafe')).toBe(false);

		await auth.setGuestAccess({ code: 'new code', hint: 'Another one' });
		expect(sessions.validate(guest.token)).toBeNull();
	});

	it('validates guest access input', async () => {
		expect((await auth.setGuestAccess({ code: '!!', hint: 'hint' })).ok).toBe(false);
		expect((await auth.setGuestAccess({ code: 'valid', hint: '  ' })).ok).toBe(false);
	});
});

describe('SessionService', () => {
	it('expires sessions', () => {
		let now = new Date('2026-01-01');
		const sessions = new SessionService(testDb(), () => now);
		const { token } = sessions.create('admin');

		expect(sessions.validate(token)?.role).toBe('admin');
		now = new Date('2026-02-01');
		expect(sessions.validate(token)).toBeNull();
	});
});
