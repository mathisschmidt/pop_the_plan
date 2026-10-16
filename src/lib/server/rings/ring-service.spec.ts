import { readdirSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';
import { ImageStore } from '../storage/image-store';
import { samplePng, tempDir, testDb } from '../testing/fixtures';
import { InvalidImageError } from './image-processor';
import { RingRepository } from './ring-repository';
import { RingService } from './ring-service';

describe('RingService', () => {
	let rings: RingService;
	let dir: string;

	beforeEach(() => {
		dir = tempDir();
		rings = new RingService(new RingRepository(testDb()), new ImageStore(dir));
	});

	it('adds a ring as pending and stores its picture', async () => {
		const ring = await rings.add(await samplePng(), 'https://shop.example/ring');

		expect(ring).toMatchObject({ status: 'pending', reason: null });
		expect(await rings.readImage(ring.id)).toBeInstanceOf(Buffer);
		expect(rings.counts()).toEqual({ pending: 1, like: 0, dislike: 0, maybe: 0 });
	});

	it('does not store anything for an invalid picture', async () => {
		await expect(rings.add(Buffer.from('nope'), null)).rejects.toBeInstanceOf(InvalidImageError);
		expect(readdirSync(dir)).toHaveLength(0);
	});

	it('records a verdict once, until the admin resets it', async () => {
		const { id } = await rings.add(await samplePng(), null);

		expect(rings.decide(id, { verdict: 'maybe', reason: 'too shiny' })).toBe(true);
		expect(rings.decide(id, { verdict: 'like', reason: null })).toBe(false);
		expect(rings.list('maybe')[0]).toMatchObject({ id, reason: 'too shiny' });

		expect(rings.resetVerdict(id)).toBe(true);
		expect(rings.list('pending')[0]).toMatchObject({ id, reason: null, decidedAt: null });
	});

	it('deletes the row and the file', async () => {
		const { id } = await rings.add(await samplePng(), null);

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
