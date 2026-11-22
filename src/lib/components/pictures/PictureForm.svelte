<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { onDestroy } from 'svelte';
	import SubmitButton from '#lib/components/ui/SubmitButton.svelte';
	import { toast } from '#lib/components/ui/Toast.svelte';
	import { cropToBlob, rotateClockwise, type PixelArea } from '#lib/client/image.ts';
	import { LINK_MAX_LENGTH, RING_IMAGE } from '#lib/domain/ring.ts';
	import ImageSourcePicker, { type PickedImage } from './ImageSourcePicker.svelte';
	import RingCropper from './RingCropper.svelte';

	interface Props {
		/** Form action receiving `image` (+ `sourceUrl`: product link or image address, and `fields`). Defaults to the page's own. */
		action?: string;
		/** See `ImageSourcePicker`. */
		remoteEndpoint: string;
		/** Extra form fields sent with the picture. */
		fields?: Record<string, string>;
		submitLabel: string;
		/** Called once the server accepted the picture (the form is already reset). */
		onsaved: () => void;
	}

	let { action, remoteEndpoint, fields = {}, submitLabel, onsaved }: Props = $props();

	let picked = $state<PickedImage | null>(null);
	let area = $state<PixelArea | null>(null);
	let pending = $state(false);
	/** Optional product page; when left empty, the image address (if any) is kept instead. */
	let productUrl = $state('');

	function replaceSource(next: PickedImage | null) {
		if (picked) URL.revokeObjectURL(picked.src);
		picked = next;
		area = null;
		if (!next) productUrl = '';
	}

	async function rotate() {
		if (!picked) return;
		replaceSource({ ...picked, src: await rotateClockwise(picked.src) });
	}

	const save: SubmitFunction = async ({ formData, cancel }) => {
		if (!picked || !area) return cancel();
		pending = true;

		// The browser does the framing; the server re-encodes to the canonical format.
		const image = await cropToBlob(picked.src, area, RING_IMAGE);
		formData.set('image', image, 'picture.jpg');
		for (const [name, value] of Object.entries(fields)) formData.set(name, value);
		const link = productUrl.trim() || picked.sourceUrl;
		if (link) formData.set('sourceUrl', link);

		return async ({ result }) => {
			pending = false;
			if (result.type === 'success') {
				replaceSource(null);
				onsaved();
			} else if (result.type === 'failure') {
				toast(String(result.data?.error ?? 'Could not save this picture'), 'error');
			} else {
				toast('Could not save this picture', 'error');
			}
		};
	};

	onDestroy(() => picked && URL.revokeObjectURL(picked.src));
</script>

{#if picked}
	<form
		method="POST"
		{action}
		enctype="multipart/form-data"
		class="flex flex-col gap-5"
		use:enhance={save}
	>
		<RingCropper src={picked.src} oncrop={(next) => (area = next)} onrotate={rotate} />
		<div>
			<label for="product-url" class="label">Product link (optional)</label>
			<input
				id="product-url"
				type="url"
				inputmode="url"
				autocomplete="off"
				placeholder="https://…"
				maxlength={LINK_MAX_LENGTH}
				class="input"
				bind:value={productUrl}
			/>
		</div>
		<div class="grid grid-cols-2 gap-3">
			<button type="button" class="btn-secondary" onclick={() => replaceSource(null)}>
				Change
			</button>
			<SubmitButton {pending}>{submitLabel}</SubmitButton>
		</div>
	</form>
{:else}
	<ImageSourcePicker onpick={replaceSource} {remoteEndpoint} />
{/if}
