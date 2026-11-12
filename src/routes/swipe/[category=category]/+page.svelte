<script lang="ts">
	import SwipeDeck from '#lib/components/swipe/SwipeDeck.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<!-- A fresh deck (queue, cards, guide) each time she switches. -->
{#key data.category}
	<SwipeDeck
		category={data.category}
		pictures={data.pictures}
		decks={data.decks}
		preview={data.preview}
	/>
{/key}
