<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { CATEGORY_ICON } from '#lib/components/ui/categories.ts';
	import LogoMenu from '#lib/components/ui/LogoMenu.svelte';
	import MenuRow from '#lib/components/ui/MenuRow.svelte';
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
</script>

<LogoMenu
	icon={CATEGORY_ICON[current]}
	label="Working on: {CATEGORY_META[current].title}. Change"
	heading="Working on"
>
	{#snippet children(close)}
		<form
			method="POST"
			action="/admin/deck"
			class="flex flex-col gap-1"
			use:enhance={() => {
				close();
				return ({ update }) => update();
			}}
		>
			<input type="hidden" name="next" value={page.url.pathname + page.url.search} />
			{#each CATEGORIES as deck (deck)}
				<MenuRow
					name="deck"
					value={deck}
					icon={CATEGORY_ICON[deck]}
					title={CATEGORY_META[deck].title}
					subtitle={open.includes(deck) ? `${pending[deck]} to review` : 'Closed to her'}
					active={deck === current}
				/>
			{/each}
		</form>
	{/snippet}
</LogoMenu>
