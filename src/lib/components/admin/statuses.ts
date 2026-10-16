import type { RingStatus } from '#lib/domain/ring.ts';

/** How each status is presented in the admin UI. */
export const STATUS_META: Record<RingStatus, { label: string; tone: string }> = {
	pending: { label: 'To review', tone: 'bg-white text-ink' },
	like: { label: 'Love', tone: 'bg-rose-soft text-rose' },
	dislike: { label: 'Nope', tone: 'bg-line/60 text-taupe' },
	maybe: { label: 'Maybe', tone: 'bg-champagne-soft text-champagne' }
};
