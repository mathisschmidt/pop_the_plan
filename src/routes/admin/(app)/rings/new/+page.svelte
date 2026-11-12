<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { onDestroy } from 'svelte';
	import ImageSourcePicker, {
		type PickedImage
	} from '#lib/components/admin/ImageSourcePicker.svelte';
	import RingCropper from '#lib/components/admin/RingCropper.svelte';
	import { CATEGORY_ICON } from '#lib/components/ui/categories.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import SubmitButton from '#lib/components/ui/SubmitButton.svelte';
	import { toast } from '#lib/components/ui/Toast.svelte';
	import { cropToBlob, rotateClockwise, type PixelArea } from '#lib/client/image.ts';
	import { CATEGORIES, CATEGORY_META, type Category } from '#lib/domain/category.ts';
	import { RING_IMAGE } from '#lib/domain/ring.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// svelte-ignore state_referenced_locally
	let category = $state<Category>(data.deck);
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
		formData.set('image', image, 'picture.jpg');
		formData.set('category', category);
		if (picked.sourceUrl) formData.set('sourceUrl', picked.sourceUrl);

		return async ({ result }) => {
			pending = false;
			if (result.type === 'success') {
				toast(`${CATEGORY_META[category].label} added ✨`);
				replaceSource(null);
			} else if (result.type === 'failure') {
				toast(String(result.data?.error ?? 'Could not save this picture'), 'error');
			} else {
				toast('Could not save this picture', 'error');
			}
		};
	};

	onDestroy(() => picked && URL.revokeObjectURL(picked.src));
</script>

<h1 class="text-3xl">Add a picture</h1>

<fieldset class="flex rounded-full border border-line bg-pearl p-1">
	<legend class="sr-only">What is it?</legend>
	{#each CATEGORIES as option (option)}
		<label
			class={[
				'flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-sm',
				category === option ? 'bg-ink text-pearl' : 'text-taupe'
			]}
		>
			<input type="radio" class="sr-only" value={option} bind:group={category} />
			<Icon name={CATEGORY_ICON[option]} class="size-4" />
			{CATEGORY_META[option].label}
		</label>
	{/each}
</fieldset>

{#if picked}
	<form method="POST" enctype="multipart/form-data" class="flex flex-col gap-5" use:enhance={save}>
		<RingCropper src={picked.src} oncrop={(next) => (area = next)} onrotate={rotate} />
		<div class="grid grid-cols-2 gap-3">
			<button type="button" class="btn-secondary" onclick={() => replaceSource(null)}>
				Change
			</button>
			<SubmitButton {pending}>Save {CATEGORY_META[category].label.toLowerCase()}</SubmitButton>
		</div>
	</form>
{:else}
	<ImageSourcePicker onpick={replaceSource} />
{/if}
