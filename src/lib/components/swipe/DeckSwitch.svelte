<script lang="ts">
	import { resolve } from '$app/paths';
	import { CATEGORY_ICON } from '#lib/components/ui/categories.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { CATEGORY_META, type Category } from '#lib/domain/category.ts';

	interface Props {
		decks: { category: Category; pending: number }[];
		current: Category;
	}

	let { decks, current }: Props = $props();
</script>

<!-- Only rendered when more than one deck is open: switching is a plain navigation. -->
<nav
	class="mx-5 flex rounded-full border border-line bg-pearl p-1"
	aria-label="Choose what to swipe"
>
	{#each decks as deck (deck.category)}
		{@const active = deck.category === current}
		<a
			href={resolve('/swipe/[category=category]', { category: deck.category })}
			data-sveltekit-replacestate
			class={[
				'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-sm transition-colors',
				active ? 'bg-ink text-pearl' : 'text-taupe active:bg-line'
			]}
			aria-current={active ? 'page' : undefined}
		>
			<Icon name={CATEGORY_ICON[deck.category]} class="size-4" />
			{CATEGORY_META[deck.category].label}
			{#if deck.pending}
				<span
					class={[
						'min-w-5 rounded-full px-1.5 text-[11px] leading-5',
						active ? 'bg-pearl/20' : 'bg-rose-soft text-rose'
					]}>{deck.pending}</span
				>
			{:else}
				<Icon name="check" class="size-3.5" strokeWidth={2.25} />
				<span class="sr-only">(done)</span>
			{/if}
		</a>
	{/each}
</nav>
