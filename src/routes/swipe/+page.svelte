<script lang="ts">
	import AllDone from '#lib/components/swipe/AllDone.svelte';
	import SwipeHeader from '#lib/components/swipe/SwipeHeader.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<div class="flex h-dvh flex-col">
	<SwipeHeader preview={data.preview} />
	<AllDone preview={data.preview} />
</div>
