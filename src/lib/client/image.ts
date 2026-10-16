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
 * Cuts `area` out of the picture and scales it to the output size.
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
	ctx.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, output.width, output.height);

	return canvasToBlob(canvas, 'image/jpeg', 0.92);
}
