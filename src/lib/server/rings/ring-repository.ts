import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';
import { CATEGORIES, type Category } from '#lib/domain/category.ts';
import type { Ring, RingAuthor, RingStatus, VerdictInput } from '#lib/domain/ring.ts';
import type { Db } from '../db/client';
import { rings } from '../db/schema';

export type StatusCounts = Record<RingStatus, number>;
export type CategoryCounts = Record<Category, number>;

export class RingRepository {
	constructor(private readonly db: Db) {}

	insert(ring: {
		id: string;
		category: Category;
		sourceUrl: string | null;
		createdAt: Date;
		/** Hers go straight to "like", decided when added. */
		addedBy?: RingAuthor;
	}): void {
		const fromHer = ring.addedBy === 'guest';
		this.db
			.insert(rings)
			.values({
				...ring,
				status: fromHer ? 'like' : 'pending',
				decidedAt: fromHer ? ring.createdAt : null
			})
			.run();
	}

	findById(id: string): Ring | undefined {
		return this.db.select().from(rings).where(eq(rings.id, id)).get();
	}

	/** Pending pictures are shown oldest first (the order they were added); decided ones newest first. */
	listByStatus(category: Category, status: RingStatus): Ring[] {
		const order = status === 'pending' ? asc(rings.createdAt) : desc(rings.decidedAt);
		return this.db
			.select()
			.from(rings)
			.where(and(eq(rings.category, category), eq(rings.status, status)))
			.orderBy(order)
			.all();
	}

	countByStatus(category: Category): StatusCounts {
		const rows = this.db
			.select({ status: rings.status, count: count() })
			.from(rings)
			.where(eq(rings.category, category))
			.groupBy(rings.status)
			.all();
		const counts: StatusCounts = { pending: 0, like: 0, dislike: 0, maybe: 0 };
		for (const row of rows) counts[row.status] = row.count;
		return counts;
	}

	countPendingByCategory(): CategoryCounts {
		const rows = this.db
			.select({ category: rings.category, count: count() })
			.from(rings)
			.where(eq(rings.status, 'pending'))
			.groupBy(rings.category)
			.all();
		const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as CategoryCounts;
		for (const row of rows) counts[row.category] = row.count;
		return counts;
	}

	/**
	 * Only a pending picture from one of `categories` can be decided: returns false otherwise
	 * (or if it does not exist).
	 */
	decide(
		id: string,
		input: VerdictInput,
		decidedAt: Date,
		categories: readonly Category[]
	): boolean {
		const result = this.db
			.update(rings)
			.set({ status: input.verdict, reason: input.reason, decidedAt })
			.where(
				and(eq(rings.id, id), eq(rings.status, 'pending'), inArray(rings.category, categories))
			)
			.run();
		return result.changes === 1;
	}

	/** Only for the admin's pictures: hers were never in her pile. */
	resetToPending(id: string): boolean {
		const result = this.db
			.update(rings)
			.set({ status: 'pending', reason: null, decidedAt: null })
			.where(and(eq(rings.id, id), eq(rings.addedBy, 'admin')))
			.run();
		return result.changes === 1;
	}

	delete(id: string): boolean {
		return this.db.delete(rings).where(eq(rings.id, id)).run().changes === 1;
	}
}
