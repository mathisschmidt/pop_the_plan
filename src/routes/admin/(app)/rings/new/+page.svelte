<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { onDestroy } from 'svelte';
	import ImageSourcePicker, {
		type PickedImage
	} from '#lib/components/admin/ImageSourcePicker.svelte';
	import RingCropper from '#lib/components/admin/RingCropper.svelte';
	import SubmitButton from '#lib/components/ui/SubmitButton.svelte';
	import { toast } from '#lib/components/ui/Toast.svelte';
	import { cropToBlob, rotateClockwise, type PixelArea } from '#lib/client/image.ts';
	import { RING_IMAGE } from '#lib/domain/ring.ts';

	let picked = $state<PickedImage | null>(null);
	let area = $state<PixelArea | null>(null);
	let pending = $state(false);

	function replaceSource(next: PickedImage | null) {
		if (picked) URL.revokeObjectURL(picked.src);
		picked = next;
		area = null;
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
		formData.set('image', image, 'ring.jpg');
		if (picked.sourceUrl) formData.set('sourceUrl', picked.sourceUrl);

		return async ({ result }) => {
			pending = false;
			if (result.type === 'success') {
				toast('Ring added 💍');
				replaceSource(null);
			} else if (result.type === 'failure') {
				toast(String(result.data?.error ?? 'Could not save this ring'), 'error');
			} else {
				toast('Could not save this ring', 'error');
			}
		};
	};

	onDestroy(() => picked && URL.revokeObjectURL(picked.src));
</script>

<h1 class="text-3xl">Add a ring</h1>

{#if picked}
	<form method="POST" enctype="multipart/form-data" class="flex flex-col gap-5" use:enhance={save}>
		<RingCropper src={picked.src} oncrop={(next) => (area = next)} onrotate={rotate} />
		<div class="grid grid-cols-2 gap-3">
			<button type="button" class="btn-secondary" onclick={() => replaceSource(null)}>
				Change
			</button>
			<SubmitButton {pending}>Save ring</SubmitButton>
		</div>
	</form>
{:else}
	<ImageSourcePicker onpick={replaceSource} />
{/if}
