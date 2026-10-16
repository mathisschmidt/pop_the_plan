import { getServices } from '#lib/server/container.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => ({
	usingDefaultPassword: (await getServices()).auth.isUsingDefaultPassword()
});
