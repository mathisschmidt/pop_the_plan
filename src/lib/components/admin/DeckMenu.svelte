<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { CATEGORY_ICON } from '#lib/components/ui/categories.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Logo from '#lib/components/ui/Logo.svelte';
	import { CATEGORIES, CATEGORY_META, type Category } from '#lib/domain/category.ts';

	interface Props {
		/** The deck the admin is working on. */
		current: Category;
		/** Decks she can see. */
		open: readonly Category[];
		/** Pictures still waiting for her, per deck. */
		pending: Record<Category, number>;
	}

	let { current, open, pending }: Props = $props();
	let expanded = $state(false);
	let root = $state<HTMLElement>();

	const next = $derived(page.url.pathname + page.url.search);

	const switchDeck: SubmitFunction = () => {
		expanded = false;
		return async ({ update }) => update();
	};

	function onclick(event: MouseEvent) {
		if (expanded && root && !root.contains(event.target as Node)) expanded = false;
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') expanded = false;
	}
</script>

<svelte:window {onclick} {onkeydown} />

<div class="relative" bind:this={root}>
	<button
		class="-mx-1 flex items-center gap-1 rounded-full px-1 py-1 active:bg-line"
		aria-haspopup="true"
		aria-expanded={expanded}
		aria-controls="deck-menu"
		onclick={() => (expanded = !expanded)}
	>
		<Logo icon={CATEGORY_ICON[current]} />
		<span class="sr-only">Working on: {CATEGORY_META[current].title}. Change</span>
		<Icon
			name="chevron"
			class={['size-4 text-taupe transition-transform', expanded && 'rotate-180'].join(' ')}
		/>
	</button>

	{#if expanded}
		<form
			id="deck-menu"
			method="POST"
			action="/admin/deck"
			class="absolute top-full left-0 z-40 mt-2 flex w-64 flex-col gap-1 rounded-3xl border border-line bg-pearl p-2 shadow-card"
			use:enhance={switchDeck}
			transition:fly={{ y: -8, duration: 150 }}
		>
			<input type="hidden" name="next" value={next} />
			<p class="px-3 pt-1 pb-1 text-xs font-medium tracking-wide text-taupe uppercase">
				Working on
			</p>
			{#each CATEGORIES as deck (deck)}
				{@const active = deck === current}
				<button
					name="deck"
					value={deck}
					class={[
						'flex min-h-12 items-center gap-3 rounded-2xl px-3 text-left',
						active ? 'bg-rose-soft/60' : 'active:bg-line'
					]}
					aria-current={active ? 'true' : undefined}
				>
					<span class="grid size-8 place-items-center rounded-full bg-rose-soft text-rose">
						<Icon name={CATEGORY_ICON[deck]} class="size-4" />
					</span>
					<span class="flex-1">
						<span class="block text-sm">{CATEGORY_META[deck].title}</span>
						<span class="block text-xs text-taupe">
							{open.includes(deck) ? `${pending[deck]} to review` : 'Closed to her'}
						</span>
					</span>
					{#if active}<Icon name="check" class="size-4 text-rose" strokeWidth={2.25} />{/if}
				</button>
			{/each}
		</form>
	{/if}
</div>
