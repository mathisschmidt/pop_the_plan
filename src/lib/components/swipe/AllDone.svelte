<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '#lib/components/ui/Icon.svelte';

	let { preview = false }: { preview?: boolean } = $props();
</script>

<main class="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
	<span class="grid size-16 place-items-center rounded-full bg-rose-soft text-rose">
		<Icon name="sparkle" class="size-8" />
	</span>
	<h1 class="text-3xl italic">That's all for now</h1>
	<p class="text-taupe">Thank you for playing. Who knows what might pop next…</p>
	{#if preview}
		<a href={resolve('/admin/(app)')} class="btn-secondary mt-4">Back to dashboard</a>
	{/if}
</main>
