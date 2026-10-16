import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'node:crypto';

/**
 * Password hashing with Node's built-in scrypt (no native dependency).
 * Stored format: `scrypt$N$r$p$<salt b64>$<hash b64>` so parameters can evolve.
 */

const PARAMS = { N: 2 ** 15, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function scrypt(secret: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		scryptCb(secret, salt, KEY_LENGTH, { ...options, maxmem: 128 * 1024 * 1024 }, (err, key) =>
			err ? reject(err) : resolve(key)
		);
	});
}

export async function hashSecret(secret: string): Promise<string> {
	const salt = randomBytes(SALT_LENGTH);
	const key = await scrypt(secret, salt, PARAMS);
	return [
		'scrypt',
		PARAMS.N,
		PARAMS.r,
		PARAMS.p,
		salt.toString('base64'),
		key.toString('base64')
	].join('$');
}

export async function verifySecret(secret: string, stored: string): Promise<boolean> {
	const [algo, n, r, p, saltB64, keyB64] = stored.split('$');
	if (algo !== 'scrypt' || !saltB64 || !keyB64) return false;

	const expected = Buffer.from(keyB64, 'base64');
	const actual = await scrypt(secret, Buffer.from(saltB64, 'base64'), {
		N: Number(n),
		r: Number(r),
		p: Number(p)
	});
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}
