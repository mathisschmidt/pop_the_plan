import type { Session } from '#lib/server/auth/session-service.ts';

// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			session: Session | null;
			/** Public origin of the app (runtime ORIGIN, or the request's own origin). */
			origin: string;
		}
	}
}

export {};
