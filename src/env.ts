import { defineEnvVars } from '@sveltejs/kit/env';

const withDefault = (fallback: string) => (value: string | undefined) => value?.trim() || fallback;

export const variables = defineEnvVars({
	ORIGIN: {
		description:
			'Public URL the app is opened with, e.g. https://pop.example.com or http://192.168.1.20:3000. ' +
			'Used for CSRF checks and Secure cookies. Defaults to the request URL (fine in dev).',
		schema: (value) => value?.trim() || undefined
	},
	DATABASE_PATH: {
		description: 'Path of the SQLite database file. Created (and seeded) on first run.',
		schema: withDefault('./data/pop-the-plan.db')
	},
	UPLOAD_DIR: {
		description: 'Directory where processed ring pictures are stored.',
		schema: withDefault('./data/uploads')
	},
	MIGRATIONS_DIR: {
		description: 'Directory containing the Drizzle SQL migrations.',
		schema: withDefault('./drizzle')
	},
	ADMIN_DEFAULT_PASSWORD: {
		description:
			'Admin password used only when the database is created for the first time (min. 8 chars). ' +
			'Checked at that moment, so builds and later starts do not need it.',
		schema: (value) => value || undefined
	}
});
