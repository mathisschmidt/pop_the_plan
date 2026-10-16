import { describe, expect, it } from 'vitest';
import { hashSecret, verifySecret } from './password';

describe('password hashing', () => {
	it('verifies the right secret only', async () => {
		const hash = await hashSecret('correct horse');
		expect(hash.startsWith('scrypt$')).toBe(true);
		expect(await verifySecret('correct horse', hash)).toBe(true);
		expect(await verifySecret('wrong horse', hash)).toBe(false);
	});

	it('salts every hash', async () => {
		expect(await hashSecret('same')).not.toBe(await hashSecret('same'));
	});

	it('rejects malformed stored hashes', async () => {
		expect(await verifySecret('x', 'garbage')).toBe(false);
	});
});
