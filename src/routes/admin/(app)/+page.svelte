<script lang="ts">
	import { resolve } from '$app/paths';
	import { STATUS_META } from '#lib/components/admin/statuses.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { RING_STATUSES } from '#lib/domain/ring.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const total = $derived(Object.values(data.counts).reduce((sum, n) => sum + n, 0));
	const reviewed = $derived(total - data.counts.pending);
</script>

<section class="flex flex-col gap-1">
	<h1 class="text-3xl">The plan</h1>
	<p class="text-sm text-taupe">
		{#if total === 0}
			No ring yet. Start by adding a few.
		{:else}
			She has reviewed {reviewed} of {total} ring{total > 1 ? 's' : ''}.
		{/if}
	</p>
</section>

<section class="grid grid-cols-2 gap-3">
	{#each RING_STATUSES as status (status)}
		<a
			href={resolve(`/admin/(app)/rings?status=${status}`)}
			class={['rounded-3xl p-4', STATUS_META[status].tone]}
		>
			<span class="block font-serif text-4xl">{data.counts[status]}</span>
			<span class="text-sm">{STATUS_META[status].label}</span>
		</a>
	{/each}
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

<a href={resolve('/rings')} class="btn-primary">
	<Icon name="eye" /> Preview her experience
</a>
