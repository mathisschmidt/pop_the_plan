<script lang="ts">
	import { resolve } from '$app/paths';
	import PictureForm from '#lib/components/pictures/PictureForm.svelte';
	import { toast } from '#lib/components/ui/Toast.svelte';
	import { CATEGORY_META } from '#lib/domain/category.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	// Follows the deck picked in the header menu.
	const category = $derived(data.deck);
</script>

<h1 class="text-3xl">{CATEGORY_META[category].addTitle}</h1>

<PictureForm
	remoteEndpoint={resolve('/admin/(app)/rings/remote')}
	fields={{ category }}
	submitLabel="Save {CATEGORY_META[category].label.toLowerCase()}"
	onsaved={() => toast(`${CATEGORY_META[category].label} added ✨`)}
/>
