<script lang="ts">
	import { resolve } from '$app/paths';
	import { CATEGORY_ICON } from '#lib/components/ui/categories.ts';
	import LogoMenu from '#lib/components/ui/LogoMenu.svelte';
	import MenuRow from '#lib/components/ui/MenuRow.svelte';
	import { CATEGORY_META, countLabel, type Category } from '#lib/domain/category.ts';

	interface Props {
		decks: { category: Category; pending: number }[];
		current: Category;
	}

	let { decks, current }: Props = $props();
</script>

<LogoMenu
	icon={CATEGORY_ICON[current]}
	label="Now: {CATEGORY_META[current].title}. Switch"
	heading="Choose"
>
	{#snippet children(close)}
		<nav class="flex flex-col gap-1" aria-label="Choose what to swipe">
			{#each decks as deck (deck.category)}
				<MenuRow
					href={resolve('/swipe/[category=category]', { category: deck.category })}
					onclick={close}
					icon={CATEGORY_ICON[deck.category]}
					title={CATEGORY_META[deck.category].title}
					subtitle={deck.pending ? `${countLabel(deck.category, deck.pending)} left` : 'All done'}
					active={deck.category === current}
				/>
			{/each}
		</nav>
	{/snippet}
</LogoMenu>
