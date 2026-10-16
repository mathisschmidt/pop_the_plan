import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { openDatabase } from '../db/client';

export const testDb = () => openDatabase(':memory:', './drizzle');

export const tempDir = () => mkdtempSync(join(tmpdir(), 'pop-the-plan-'));

export const samplePng = () =>
	sharp({ create: { width: 800, height: 1000, channels: 3, background: '#e8d7c3' } })
		.png()
		.toBuffer();
