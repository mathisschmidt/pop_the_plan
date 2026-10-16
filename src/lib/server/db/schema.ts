import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

const timestamp = (name: string) => integer(name, { mode: 'timestamp_ms' });

/** Singleton row (id = 1): everything the admin configures. */
export const appSettings = sqliteTable(
	'app_settings',
	{
		id: integer('id').primaryKey(),
		adminPasswordHash: text('admin_password_hash').notNull(),
		adminPasswordIsDefault: integer('admin_password_is_default', { mode: 'boolean' })
			.notNull()
			.default(true),
		guestCodeHash: text('guest_code_hash'),
		guestHint: text('guest_hint'),
		updatedAt: timestamp('updated_at').notNull()
	},
	(t) => [check('app_settings_singleton', sql`${t.id} = 1`)]
);

export const sessions = sqliteTable(
	'sessions',
	{
		/** SHA-256 of the cookie token: a DB leak does not leak usable sessions. */
		id: text('id').primaryKey(),
		role: text('role', { enum: ['admin', 'guest'] }).notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at').notNull()
	},
	(t) => [
		index('sessions_role_idx').on(t.role),
		check('sessions_role_check', sql`${t.role} in ('admin', 'guest')`)
	]
);

export const rings = sqliteTable(
	'rings',
	{
		id: text('id').primaryKey(),
		status: text('status', { enum: ['pending', 'like', 'dislike', 'maybe'] })
			.notNull()
			.default('pending'),
		reason: text('reason'),
		sourceUrl: text('source_url'),
		createdAt: timestamp('created_at').notNull(),
		decidedAt: timestamp('decided_at')
	},
	(t) => [
		index('rings_status_idx').on(t.status, t.createdAt),
		check('rings_status_check', sql`${t.status} in ('pending', 'like', 'dislike', 'maybe')`),
		check('rings_reason_check', sql`(${t.status} = 'maybe') = (${t.reason} is not null)`)
	]
);
