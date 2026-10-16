/**
 * Ring domain: shared by server and client. Must stay free of any runtime dependency.
 */

/** Every ring picture is normalised to this exact size (portrait 4:5, like a phone card). */
export const RING_IMAGE = {
	width: 1080,
	height: 1350,
	aspect: 1080 / 1350,
	mimeType: 'image/webp',
	extension: 'webp'
} as const;

export const VERDICTS = ['like', 'dislike', 'maybe'] as const;
export type Verdict = (typeof VERDICTS)[number];

/** `pending` = not evaluated yet. */
export type RingStatus = Verdict | 'pending';
export const RING_STATUSES: readonly RingStatus[] = ['pending', ...VERDICTS];

export const REASON_MAX_LENGTH = 280;

export interface Ring {
	id: string;
	status: RingStatus;
	reason: string | null;
	sourceUrl: string | null;
	createdAt: Date;
	decidedAt: Date | null;
}

export type VerdictInput =
	{ verdict: 'like' | 'dislike'; reason: null } | { verdict: 'maybe'; reason: string };

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function isVerdict(value: unknown): value is Verdict {
	return typeof value === 'string' && (VERDICTS as readonly string[]).includes(value);
}

export function isRingStatus(value: unknown): value is RingStatus {
	return typeof value === 'string' && (RING_STATUSES as readonly string[]).includes(value);
}

/** A "maybe" always needs a reason; likes and dislikes never carry one. */
export function parseVerdictInput(verdict: unknown, reason: unknown): ParseResult<VerdictInput> {
	if (!isVerdict(verdict)) return { ok: false, error: 'Unknown verdict' };

	if (verdict !== 'maybe') return { ok: true, value: { verdict, reason: null } };

	const text = typeof reason === 'string' ? reason.trim() : '';
	if (!text) return { ok: false, error: 'Tell us what bothers you about this one' };
	if (text.length > REASON_MAX_LENGTH) {
		return { ok: false, error: `Keep it under ${REASON_MAX_LENGTH} characters` };
	}
	return { ok: true, value: { verdict, reason: text } };
}

export function ringImageUrl(id: string): string {
	return `/media/rings/${id}`;
}
