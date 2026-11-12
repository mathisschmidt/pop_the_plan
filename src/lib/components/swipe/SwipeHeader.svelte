<script lang="ts">
	import { resolve } from '$app/paths';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Logo from '#lib/components/ui/Logo.svelte';
	import LogoutButton from '#lib/components/ui/LogoutButton.svelte';

	interface Props {
		preview: boolean;
		/** Shows the "?" button when set. */
		onhelp?: () => void;
	}

	let { preview, onhelp }: Props = $props();
</script>

<header class="flex items-center justify-between px-5 py-3">
	<Logo />
	<div class="flex items-center gap-1">
		{#if onhelp}
			<button
				class="grid size-10 place-items-center rounded-full text-taupe active:bg-line"
				aria-label="How does it work?"
				onclick={onhelp}
			>
				<Icon name="help" class="size-6" />
			</button>
		{/if}
		{#if preview}
			<a href={resolve('/admin/(app)')} class="btn-secondary h-9 px-4 text-xs">Exit preview</a>
		{:else}
			<LogoutButton />
		{/if}
	</div>
</header>

{#if preview}
	<p class="mx-5 rounded-full bg-champagne-soft px-4 py-2 text-center text-xs text-champagne">
		Preview — your swipes are not saved
	</p>
{/if}
