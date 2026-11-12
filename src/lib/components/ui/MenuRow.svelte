<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';

	type Target =
		/** Already `resolve()`d link. */
		| { href: string; onclick?: () => void }
		/** Submit button of the surrounding form. */
		| { name: string; value: string };

	type Props = Target & {
		icon: IconName;
		title: string;
		subtitle: string;
		active: boolean;
	};

	let { icon, title, subtitle, active, ...target }: Props = $props();
	const classes = $derived([
		'flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left',
		active ? 'bg-rose-soft/60' : 'active:bg-line'
	]);
</script>

{#snippet content()}
	<span class="grid size-8 place-items-center rounded-full bg-rose-soft text-rose">
		<Icon name={icon} class="size-4" />
	</span>
	<span class="flex-1">
		<span class="block text-sm">{title}</span>
		<span class="block text-xs text-taupe">{subtitle}</span>
	</span>
	{#if active}<Icon name="check" class="size-4 text-rose" strokeWidth={2.25} />{/if}
{/snippet}

{#if 'href' in target}
	<!-- eslint-disable svelte/no-navigation-without-resolve -- resolved by the caller -->
	<a
		href={target.href}
		data-sveltekit-replacestate
		class={classes}
		aria-current={active ? 'page' : undefined}
		onclick={target.onclick}
	>
		{@render content()}
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
	<button
		name={target.name}
		value={target.value}
		class={classes}
		aria-current={active ? 'true' : undefined}
	>
		{@render content()}
	</button>
{/if}
