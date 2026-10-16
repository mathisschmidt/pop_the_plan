import {
	ADMIN_DEFAULT_PASSWORD,
	DATABASE_PATH,
	MIGRATIONS_DIR,
	ORIGIN,
	UPLOAD_DIR
} from '$app/env/private';
import { PASSWORD_MIN_LENGTH } from '#lib/domain/auth.ts';
import { AuthService } from './auth/auth-service';
import { SessionService } from './auth/session-service';
import { openDatabase } from './db/client';
import { RingRepository } from './rings/ring-repository';
import { RingService } from './rings/ring-service';
import { parseOrigin } from './security/csrf';
import { hashSecret } from './security/password';
import { RateLimiter } from './security/rate-limiter';
import { SettingsRepository } from './settings/settings-repository';
import { ImageStore } from './storage/image-store';

/**
 * Composition root: the only place that knows about env vars and wires
 * concrete implementations together. Everything else receives its dependencies.
 */
export interface Services {
	auth: AuthService;
	sessions: SessionService;
	rings: RingService;
	loginLimiter: RateLimiter;
	/** Public origin from ORIGIN; `undefined` = derive it from each request (dev). */
	origin: string | undefined;
}

let services: Promise<Services> | undefined;

async function build(): Promise<Services> {
	const db = openDatabase(DATABASE_PATH, MIGRATIONS_DIR);

	const settings = new SettingsRepository(db);
	// First run: no settings row yet -> seed the admin with the default password from the env.
	if (!settings.find()) settings.initialize(await hashSecret(requireDefaultPassword()));

	const sessions = new SessionService(db);
	sessions.purgeExpired();

	return {
		auth: new AuthService(settings, sessions),
		sessions,
		rings: new RingService(new RingRepository(db), new ImageStore(`${UPLOAD_DIR}/rings`)),
		loginLimiter: new RateLimiter(10, 15 * 60 * 1000),
		origin: ORIGIN ? parseOrigin(ORIGIN) : undefined
	};
}

function requireDefaultPassword(): string {
	if (!ADMIN_DEFAULT_PASSWORD || ADMIN_DEFAULT_PASSWORD.length < PASSWORD_MIN_LENGTH) {
		throw new Error(
			`First start: ADMIN_DEFAULT_PASSWORD must be set (min. ${PASSWORD_MIN_LENGTH} characters) to create the admin account`
		);
	}
	return ADMIN_DEFAULT_PASSWORD;
}

export function getServices(): Promise<Services> {
	services ??= build().catch((err) => {
		services = undefined;
		throw err;
	});
	return services;
}
