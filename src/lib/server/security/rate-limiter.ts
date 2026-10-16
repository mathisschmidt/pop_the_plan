/**
 * Tiny in-memory fixed-window rate limiter. Good enough for a single-process,
 * two-user app; swap for a shared store if this ever runs on several instances.
 */
export class RateLimiter {
	readonly #hits = new Map<string, { count: number; resetAt: number }>();

	constructor(
		private readonly max: number,
		private readonly windowMs: number,
		private readonly now: () => number = Date.now
	) {}

	/** Returns the remaining wait in ms if the key is blocked, otherwise records the hit and returns 0. */
	hit(key: string): number {
		const now = this.now();
		const entry = this.#hits.get(key);

		if (!entry || entry.resetAt <= now) {
			this.#hits.set(key, { count: 1, resetAt: now + this.windowMs });
			this.#sweep(now);
			return 0;
		}
		if (entry.count >= this.max) return entry.resetAt - now;

		entry.count++;
		return 0;
	}

	reset(key: string): void {
		this.#hits.delete(key);
	}

	#sweep(now: number): void {
		if (this.#hits.size < 1000) return;
		for (const [key, entry] of this.#hits) if (entry.resetAt <= now) this.#hits.delete(key);
	}
}
