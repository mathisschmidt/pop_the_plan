import { randomUUID } from 'node:crypto';
import type { Category } from '#lib/domain/category.ts';
import { RING_IMAGE, type Ring, type RingStatus, type VerdictInput } from '#lib/domain/ring.ts';
import type { ImageStore } from '../storage/image-store';
import { normalizeRingImage } from './image-processor';
import type { CategoryCounts, RingRepository, StatusCounts } from './ring-repository';

/** What the ring service needs to know about decks (see `DeckService`). */
export interface OpenDecks {
	open(): readonly Category[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const isRingId = (value: string) => UUID.test(value);

const imageKey = (id: string) => `${id}.${RING_IMAGE.extension}`;

export class RingService {
	constructor(
		private readonly repository: RingRepository,
		private readonly images: ImageStore,
		private readonly decks: OpenDecks,
		private readonly now: () => Date = () => new Date()
	) {}

	list(category: Category, status: RingStatus): Ring[] {
		return this.repository.listByStatus(category, status);
	}

	counts(category: Category): StatusCounts {
		return this.repository.countByStatus(category);
	}

	/** How many pictures are still waiting for her, per deck. */
	pendingCounts(): CategoryCounts {
		return this.repository.countPendingByCategory();
	}

	/** @throws InvalidImageError when the upload is not a usable picture. */
	async add(category: Category, image: Buffer, sourceUrl: string | null): Promise<Ring> {
		const processed = await normalizeRingImage(image);
		const id = randomUUID();

		await this.images.save(imageKey(id), processed);
		try {
			this.repository.insert({ id, category, sourceUrl, createdAt: this.now() });
		} catch (err) {
			await this.images.remove(imageKey(id));
			throw err;
		}
		return this.repository.findById(id)!;
	}

	async remove(id: string): Promise<boolean> {
		if (!isRingId(id) || !this.repository.delete(id)) return false;
		await this.images.remove(imageKey(id));
		return true;
	}

	/** She can only decide on a pending picture from an open deck. */
	decide(id: string, input: VerdictInput): boolean {
		return isRingId(id) && this.repository.decide(id, input, this.now(), this.decks.open());
	}

	resetVerdict(id: string): boolean {
		return isRingId(id) && this.repository.resetToPending(id);
	}

	async readImage(id: string): Promise<Buffer | null> {
		if (!isRingId(id)) return null;
		return this.images.read(imageKey(id));
	}
}
