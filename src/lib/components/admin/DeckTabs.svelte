<script lang="ts">
	import { CATEGORY_ICON } from '#lib/components/ui/categories.ts';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { CATEGORIES, CATEGORY_META, type Category } from '#lib/domain/category.ts';

	interface Props {
		current: Category;
		/** Already `resolve()`d link for each deck. */
		href: (category: Category) => string;
		/** Decks she can see: the others are marked as closed. */
		open: readonly Category[];
	}

	let { current, href, open }: Props = $props();
</script>

<nav class="flex rounded-full border border-line bg-pearl p-1" aria-label="Choose a deck">
	{#each CATEGORIES as category (category)}
		{@const active = category === current}
		<!-- eslint-disable svelte/no-navigation-without-resolve -- resolved by the caller -->
		<a
			href={href(category)}
			data-sveltekit-replacestate
			data-sveltekit-noscroll
			class={[
				'flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-sm',
				active ? 'bg-ink text-pearl' : 'text-taupe active:bg-line'
			]}
			aria-current={active ? 'page' : undefined}
		>
			<Icon name={CATEGORY_ICON[category]} class="size-4" />
			{CATEGORY_META[category].label}
			{#if !open.includes(category)}
				<span class="size-1.5 rounded-full bg-line" title="Closed to her"></span>
				<span class="sr-only">(closed)</span>
			{/if}
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	{/each}
</nav>
