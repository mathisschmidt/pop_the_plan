/**
 * Browser-only image helpers for the add-ring flow (canvas based).
 */

export interface PixelArea {
	x: number;
	y: number;
	width: number;
	height: number;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error('Could not read this image'));
		image.src = src;
	});
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
	return new Promise((resolve, reject) =>
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Could not export the image'))),
			type,
			quality
		)
	);
}

function context(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas is not supported');
	return ctx;
}

/** Rotates a picture by 90° clockwise and returns a new object URL (caller revokes it). */
export async function rotateClockwise(src: string): Promise<string> {
	const image = await loadImage(src);
	const canvas = document.createElement('canvas');
	canvas.width = image.naturalHeight;
	canvas.height = image.naturalWidth;

	const ctx = context(canvas);
	ctx.translate(canvas.width, 0);
	ctx.rotate(Math.PI / 2);
	ctx.drawImage(image, 0, 0);

	return URL.createObjectURL(await canvasToBlob(canvas, 'image/png'));
}

/**
 * Cuts `area` out of the picture and scales it to the output size. `area` may extend
 * past the picture (zoomed out); the uncovered part stays white.
 * JPEG because every mobile browser can encode it (Safari cannot encode WebP);
 * the server converts it to the canonical WebP anyway.
 */
export async function cropToBlob(
	src: string,
	area: PixelArea,
	output: { width: number; height: number }
): Promise<Blob> {
	const image = await loadImage(src);
	const canvas = document.createElement('canvas');
	canvas.width = output.width;
	canvas.height = output.height;

	const ctx = context(canvas);
	ctx.imageSmoothingQuality = 'high';
	ctx.fillStyle = '#ffffff'; // transparent PNGs get a clean background instead of black
	ctx.fillRect(0, 0, output.width, output.height);

	// When zoomed out, `area` reaches past the picture's edges: draw only the part that
	// exists, at the matching spot, and leave the rest as the background fill.
	const scaleX = output.width / area.width;
	const scaleY = output.height / area.height;
	const sx = Math.max(0, area.x);
	const sy = Math.max(0, area.y);
	const sw = Math.min(image.naturalWidth, area.x + area.width) - sx;
	const sh = Math.min(image.naturalHeight, area.y + area.height) - sy;
	if (sw > 0 && sh > 0) {
		ctx.drawImage(
			image,
			sx,
			sy,
			sw,
			sh,
			(sx - area.x) * scaleX,
			(sy - area.y) * scaleY,
			sw * scaleX,
			sh * scaleY
		);
	}

	return canvasToBlob(canvas, 'image/jpeg', 0.92);
}
