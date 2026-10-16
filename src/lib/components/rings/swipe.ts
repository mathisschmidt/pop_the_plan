import type { Verdict } from '#lib/domain/ring.ts';

export type SwipeDirection = 'left' | 'right' | 'down';

export const DIRECTION_VERDICT: Record<SwipeDirection, Verdict> = {
	right: 'like',
	left: 'dislike',
	down: 'maybe'
};

/** Distance (px) after which releasing the card commits the swipe. */
export const SWIPE_THRESHOLD = 100;

/** Which way a drag is heading, or null while it is still undecided. */
export function swipeIntent(
	dx: number,
	dy: number,
	threshold = SWIPE_THRESHOLD
): SwipeDirection | null {
	if (dy > threshold && dy > Math.abs(dx)) return 'down';
	if (Math.abs(dx) > threshold && Math.abs(dx) >= dy) return dx > 0 ? 'right' : 'left';
	return null;
}

/** 0..1 progress towards each direction, used to fade in the stamps. */
export function swipeProgress(dx: number, dy: number, threshold = SWIPE_THRESHOLD) {
	const clamp = (v: number) => Math.min(Math.max(v / threshold, 0), 1);
	const vertical = dy > Math.abs(dx);
	return {
		right: vertical ? 0 : clamp(dx),
		left: vertical ? 0 : clamp(-dx),
		down: vertical ? clamp(dy) : 0
	};
}
