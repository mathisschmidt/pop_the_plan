import { randomUUID } from 'node:crypto';
import { RING_IMAGE, type Ring, type RingStatus, type VerdictInput } from '#lib/domain/ring.ts';
import type { ImageStore } from '../storage/image-store';
import { normalizeRingImage } from './image-processor';
import type { RingRepository, StatusCounts } from './ring-repository';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const isRingId = (value: string) => UUID.test(value);

const imageKey = (id: string) => `${id}.${RING_IMAGE.extension}`;

export class RingService {
	constructor(
		private readonly repository: RingRepository,
		private readonly images: ImageStore,
		private readonly now: () => Date = () => new Date()
	) {}

	list(status: RingStatus): Ring[] {
		return this.repository.listByStatus(status);
	}

	counts(): StatusCounts {
		return this.repository.countByStatus();
	}

	/** @throws InvalidImageError when the upload is not a usable picture. */
	async add(image: Buffer, sourceUrl: string | null): Promise<Ring> {
		const processed = await normalizeRingImage(image);
		const id = randomUUID();

		await this.images.save(imageKey(id), processed);
		try {
			this.repository.insert({ id, sourceUrl, createdAt: this.now() });
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

	decide(id: string, input: VerdictInput): boolean {
		return isRingId(id) && this.repository.decide(id, input, this.now());
	}

	resetVerdict(id: string): boolean {
		return isRingId(id) && this.repository.resetToPending(id);
	}

	async readImage(id: string): Promise<Buffer | null> {
		if (!isRingId(id)) return null;
		return this.images.read(imageKey(id));
	}
}
