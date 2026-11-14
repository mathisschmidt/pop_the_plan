<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '#lib/components/ui/Icon.svelte';

	import type { Category } from '#lib/domain/category.ts';

	interface Props {
		preview?: boolean;
		/** Offers to add one she loves to this deck when set. */
		addTo?: Category;
	}

	let { preview = false, addTo }: Props = $props();
</script>

<main class="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
	<span class="grid size-16 place-items-center rounded-full bg-rose-soft text-rose">
		<Icon name="sparkle" class="size-8" />
	</span>
	<h1 class="text-3xl italic">That's all for now</h1>
	<p class="text-taupe">Thank you for playing. Who knows what might pop next…</p>
	{#if addTo}
		<a
			href={resolve('/swipe/[category=category]/add', { category: addTo })}
			class="btn-secondary mt-4"
		>
			<Icon name="plus" /> Add one I love
		</a>
	{/if}
	{#if preview}
		<a href={resolve('/admin/(app)')} class="btn-secondary mt-4">Back to dashboard</a>
	{/if}
</main>
