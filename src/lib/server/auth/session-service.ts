import { createHash, randomBytes } from 'node:crypto';
import { and, count, eq, lt, ne } from 'drizzle-orm';
import type { Role } from '#lib/domain/auth.ts';
import type { Db } from '../db/client';
import { sessions } from '../db/schema';

export interface Session {
	id: string;
	role: Role;
	expiresAt: Date;
}

export const SESSION_TTL_MS: Record<Role, number> = {
	admin: 7 * 24 * 60 * 60 * 1000,
	// She should not have to guess the code again every week.
	guest: 90 * 24 * 60 * 60 * 1000
};

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export class SessionService {
	constructor(
		private readonly db: Db,
		private readonly now: () => Date = () => new Date()
	) {}

	/** Returns the raw token (for the cookie); only its hash is stored. */
	create(role: Role): { token: string; session: Session } {
		const token = randomBytes(32).toString('base64url');
		const now = this.now();
		const session: Session = {
			id: hashToken(token),
			role,
			expiresAt: new Date(now.getTime() + SESSION_TTL_MS[role])
		};
		this.db
			.insert(sessions)
			.values({ ...session, createdAt: now })
			.run();
		return { token, session };
	}

	validate(token: string): Session | null {
		const id = hashToken(token);
		const row = this.db.select().from(sessions).where(eq(sessions.id, id)).get();
		if (!row) return null;

		if (row.expiresAt <= this.now()) {
			this.db.delete(sessions).where(eq(sessions.id, id)).run();
			return null;
		}
		return { id: row.id, role: row.role, expiresAt: row.expiresAt };
	}

	invalidate(sessionId: string): void {
		this.db.delete(sessions).where(eq(sessions.id, sessionId)).run();
	}

	/** Signs out every session of a role, optionally keeping the current one. */
	invalidateRole(role: Role, keepSessionId?: string): void {
		const byRole = eq(sessions.role, role);
		this.db
			.delete(sessions)
			.where(keepSessionId ? and(byRole, ne(sessions.id, keepSessionId)) : byRole)
			.run();
	}

	countActive(role: Role): number {
		this.purgeExpired();
		const row = this.db
			.select({ count: count() })
			.from(sessions)
			.where(eq(sessions.role, role))
			.get();
		return row?.count ?? 0;
	}

	purgeExpired(): void {
		this.db.delete(sessions).where(lt(sessions.expiresAt, this.now())).run();
	}
}
