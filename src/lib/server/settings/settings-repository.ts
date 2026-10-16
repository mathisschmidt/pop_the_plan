import { eq } from 'drizzle-orm';
import type { Db } from '../db/client';
import { appSettings } from '../db/schema';

export type AppSettings = typeof appSettings.$inferSelect;

const SINGLETON_ID = 1;

export class SettingsRepository {
	constructor(private readonly db: Db) {}

	find(): AppSettings | undefined {
		return this.db.select().from(appSettings).where(eq(appSettings.id, SINGLETON_ID)).get();
	}

	get(): AppSettings {
		const settings = this.find();
		if (!settings) throw new Error('App settings are not initialised');
		return settings;
	}

	/** Creates the singleton row on first run; no-op afterwards. */
	initialize(defaultPasswordHash: string): void {
		this.db
			.insert(appSettings)
			.values({
				id: SINGLETON_ID,
				adminPasswordHash: defaultPasswordHash,
				adminPasswordIsDefault: true,
				updatedAt: new Date()
			})
			.onConflictDoNothing()
			.run();
	}

	update(values: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>): void {
		this.db
			.update(appSettings)
			.set({ ...values, updatedAt: new Date() })
			.where(eq(appSettings.id, SINGLETON_ID))
			.run();
	}
}
