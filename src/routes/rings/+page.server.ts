import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Before decks existed, her home was /rings: keep old links and bookmarks working.
export const load: PageServerLoad = () => {
	redirect(308, '/swipe');
};
