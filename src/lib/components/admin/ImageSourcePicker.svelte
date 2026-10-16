<script lang="ts">
	import Icon from '#lib/components/ui/Icon.svelte';

	export interface PickedImage {
		/** Same-origin object URL (the caller owns it and must revoke it). */
		src: string;
		/** Where it came from, kept so the admin can find the shop again. */
		sourceUrl: string | null;
	}

	let { onpick }: { onpick: (image: PickedImage) => void } = $props();

	let mode = $state<'file' | 'url'>('file');
	let url = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	function pickFile(event: Event) {
		const file = (event.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			error = 'This file is not an image';
			return;
		}
		onpick({ src: URL.createObjectURL(file), sourceUrl: null });
	}

	async function pickUrl(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		error = null;
		try {
			// Goes through our server: a canvas cannot export images from other origins.
			const response = await fetch(`/admin/rings/remote?url=${encodeURIComponent(url.trim())}`);
			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(body?.message ?? 'Could not load this image');
			}
			onpick({ src: URL.createObjectURL(await response.blob()), sourceUrl: url.trim() });
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not load this image';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex flex-col gap-4">
	<div class="grid grid-cols-2 rounded-full bg-line/60 p-1 text-sm" role="tablist">
		{#each [{ id: 'file', label: 'From my phone', icon: 'upload' }, { id: 'url', label: 'From a link', icon: 'link' }] as const as tab (tab.id)}
			<button
				type="button"
				role="tab"
				aria-selected={mode === tab.id}
				class={[
					'flex items-center justify-center gap-2 rounded-full py-2.5 transition',
					mode === tab.id ? 'bg-pearl text-ink shadow-sm' : 'text-taupe'
				]}
				onclick={() => {
					mode = tab.id;
					error = null;
				}}
			>
				<Icon name={tab.icon} class="size-4" />
				{tab.label}
			</button>
		{/each}
	</div>

	{#if mode === 'file'}
		<label
			class="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-line bg-pearl text-taupe active:bg-white"
		>
			<span class="grid size-14 place-items-center rounded-full bg-rose-soft text-rose">
				<Icon name="upload" class="size-6" />
			</span>
			<span class="text-sm">Choose a picture</span>
			<input type="file" accept="image/*" class="sr-only" onchange={pickFile} />
		</label>
	{:else}
		<form class="flex flex-col gap-3" onsubmit={pickUrl}>
			<label for="image-url" class="label">Image address</label>
			<input
				id="image-url"
				type="url"
				inputmode="url"
				class="input"
				placeholder="https://…/ring.jpg"
				bind:value={url}
				required
			/>
			<p class="text-xs text-taupe">
				Long-press the picture on the shop site, then “Copy image address”.
			</p>
			<button class="btn-primary" disabled={loading || !url.trim()}>
				{loading ? 'Loading…' : 'Load picture'}
			</button>
		</form>
	{/if}

	{#if error}<p class="error-text">{error}</p>{/if}
</div>
