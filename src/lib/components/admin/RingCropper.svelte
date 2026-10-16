<script lang="ts">
	import Cropper from 'svelte-easy-crop';
	import Icon from '#lib/components/ui/Icon.svelte';
	import type { PixelArea } from '#lib/client/image.ts';
	import { RING_IMAGE } from '#lib/domain/ring.ts';

	interface Props {
		src: string;
		/** Called as the admin pans / zooms with the region to keep, in source pixels. */
		oncrop: (area: PixelArea) => void;
		onrotate: () => void;
	}

	let { src, oncrop, onrotate }: Props = $props();

	let crop = $state({ x: 0, y: 0 });
	let zoom = $state(1);
</script>

<div class="flex flex-col gap-4">
	<div class="relative aspect-square w-full overflow-hidden rounded-3xl bg-ink">
		<Cropper
			image={src}
			bind:crop
			bind:zoom
			aspect={RING_IMAGE.aspect}
			maxZoom={4}
			oncropcomplete={(event) => oncrop(event.pixels)}
		/>
	</div>

	<div class="flex items-center gap-3">
		<label for="zoom" class="text-xs text-taupe">Zoom</label>
		<input
			id="zoom"
			type="range"
			min="1"
			max="4"
			step="0.01"
			bind:value={zoom}
			class="h-1 flex-1 accent-rose"
		/>
		<button
			type="button"
			class="grid size-10 place-items-center rounded-full border border-line bg-pearl text-taupe active:bg-white"
			aria-label="Rotate 90°"
			onclick={onrotate}
		>
			<Icon name="rotate" />
		</button>
	</div>
	<p class="text-center text-xs text-taupe">Drag and pinch to frame the ring.</p>
</div>
