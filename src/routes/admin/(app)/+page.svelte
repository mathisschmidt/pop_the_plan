<script lang="ts">
	import { resolve } from '$app/paths';
	import DeckTabs from '#lib/components/admin/DeckTabs.svelte';
	import { STATUS_META } from '#lib/components/admin/statuses.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { CATEGORY_META, countLabel } from '#lib/domain/category.ts';
	import { RING_STATUSES } from '#lib/domain/ring.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const total = $derived(Object.values(data.counts).reduce((sum, n) => sum + n, 0));
	const reviewed = $derived(total - data.counts.pending);
	const isOpen = $derived(data.openDecks.includes(data.deck));
	const unit = $derived(CATEGORY_META[data.deck].unit.other);
</script>

<section class="flex flex-col gap-1">
	<h1 class="text-3xl">The plan</h1>
	<p class="text-sm text-taupe">
		{#if data.openDecks.length}
			She can see: {data.openDecks.map((c) => CATEGORY_META[c].label.toLowerCase()).join(', ')}.
		{:else}
			Every deck is closed: she has nothing to swipe.
		{/if}
	</p>
</section>

<DeckTabs
	current={data.deck}
	open={data.openDecks}
	href={(deck) => resolve(`/admin/(app)?deck=${deck}`)}
/>

<section class="flex flex-col gap-3">
	<p class="text-sm text-taupe">
		{#if total === 0}
			No {unit} yet. Start by adding a few.
		{:else}
			She has reviewed {reviewed} of {countLabel(data.deck, total)}.
		{/if}
		{#if !isOpen}
			<a href={resolve('/admin/(app)/settings')} class="text-rose underline">Closed to her</a>.
		{/if}
	</p>

	<div class="grid grid-cols-2 gap-3">
		{#each RING_STATUSES as status (status)}
			<a
				href={resolve(`/admin/(app)/rings?deck=${data.deck}&status=${status}`)}
				class={['rounded-3xl p-4', STATUS_META[status].tone]}
			>
				<span class="block font-serif text-4xl">{data.counts[status]}</span>
				<span class="text-sm">{STATUS_META[status].label}</span>
			</a>
		{/each}
	</div>
</section>

<section class="flex flex-col gap-3 panel">
	<h2 class="text-xl">Her access</h2>
	{#if data.guestAccess.enabled}
		<p class="font-serif text-ink italic">“{data.guestAccess.hint}”</p>
		<p class="text-sm text-taupe">
			Signed in on {data.guestDevices} device{data.guestDevices === 1 ? '' : 's'}.
		</p>
	{:else}
		<p class="text-sm text-taupe">No code yet: she cannot sign in.</p>
	{/if}
	<a href={resolve('/admin/(app)/settings')} class="btn-secondary">Manage access</a>
</section>

<a href={resolve('/swipe/[category=category]', { category: data.deck })} class="btn-primary">
	<Icon name="eye" /> Preview her experience
</a>
