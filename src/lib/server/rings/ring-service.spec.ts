import { readdirSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Category } from '#lib/domain/category.ts';
import { ImageStore } from '../storage/image-store';
import { samplePng, tempDir, testDb } from '../testing/fixtures';
import { InvalidImageError } from './image-processor';
import { RingRepository } from './ring-repository';
import { RingService } from './ring-service';

describe('RingService', () => {
	let rings: RingService;
	let dir: string;
	let open: Category[];

	beforeEach(() => {
		dir = tempDir();
		open = ['ring', 'dress', 'shoes'];
		rings = new RingService(new RingRepository(testDb()), new ImageStore(dir), {
			open: () => open
		});
	});

	it('adds a picture as pending and stores it', async () => {
		const ring = await rings.add('ring', await samplePng(), 'https://shop.example/ring');

		expect(ring).toMatchObject({ category: 'ring', status: 'pending', reason: null });
		expect(await rings.readImage(ring.id)).toBeInstanceOf(Buffer);
		expect(rings.counts('ring')).toEqual({ pending: 1, like: 0, dislike: 0, maybe: 0 });
	});

	it('keeps each deck separate', async () => {
		const dress = await rings.add('dress', await samplePng(), null);
		await rings.add('shoes', await samplePng(), null);
		await rings.add('shoes', await samplePng(), null);

		expect(rings.list('dress', 'pending').map((r) => r.id)).toEqual([dress.id]);
		expect(rings.list('ring', 'pending')).toEqual([]);
		expect(rings.counts('shoes').pending).toBe(2);
		expect(rings.pendingCounts()).toEqual({ ring: 0, dress: 1, shoes: 2 });

		rings.decide(dress.id, { verdict: 'like', reason: null });
		expect(rings.pendingCounts()).toEqual({ ring: 0, dress: 0, shoes: 2 });
		expect(rings.counts('dress')).toEqual({ pending: 0, like: 1, dislike: 0, maybe: 0 });
	});

	it('does not store anything for an invalid picture', async () => {
		await expect(rings.add('ring', Buffer.from('nope'), null)).rejects.toBeInstanceOf(
			InvalidImageError
		);
		expect(readdirSync(dir)).toHaveLength(0);
	});

	it('records a verdict once, until the admin resets it', async () => {
		const { id } = await rings.add('ring', await samplePng(), null);

		expect(rings.decide(id, { verdict: 'maybe', reason: 'too shiny' })).toBe(true);
		expect(rings.decide(id, { verdict: 'like', reason: null })).toBe(false);
		expect(rings.list('ring', 'maybe')[0]).toMatchObject({ id, reason: 'too shiny' });

		expect(rings.resetVerdict(id)).toBe(true);
		expect(rings.list('ring', 'pending')[0]).toMatchObject({ id, reason: null, decidedAt: null });
	});

	it('refuses verdicts on a closed deck', async () => {
		const { id } = await rings.add('dress', await samplePng(), null);
		open = ['ring'];

		expect(rings.decide(id, { verdict: 'like', reason: null })).toBe(false);
		expect(rings.counts('dress').pending).toBe(1);

		open = ['ring', 'dress'];
		expect(rings.decide(id, { verdict: 'like', reason: null })).toBe(true);
	});

	it('deletes the row and the file', async () => {
		const { id } = await rings.add('ring', await samplePng(), null);

		expect(await rings.remove(id)).toBe(true);
		expect(await rings.readImage(id)).toBeNull();
		expect(readdirSync(dir)).toHaveLength(0);
		expect(await rings.remove(id)).toBe(false);
	});

	it('ignores malformed ids', async () => {
		expect(rings.decide('../../etc', { verdict: 'like', reason: null })).toBe(false);
		expect(await rings.readImage('../../etc')).toBeNull();
	});
});
