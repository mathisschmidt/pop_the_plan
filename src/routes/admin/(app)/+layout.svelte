<script lang="ts">
	import { resolve } from '$app/paths';
	import AdminNav from '#lib/components/admin/AdminNav.svelte';
	import Logo from '#lib/components/ui/Logo.svelte';
	import LogoutButton from '#lib/components/ui/LogoutButton.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<header class="flex items-center justify-between px-5 py-3">
	<a href={resolve('/admin/(app)')}><Logo /></a>
	<LogoutButton />
</header>

{#if data.usingDefaultPassword}
	<a
		href={resolve('/admin/(app)/settings')}
		class="mx-5 mb-2 block rounded-2xl bg-champagne-soft px-4 py-3 text-sm text-ink"
	>
		You are still using the default password. <span class="underline">Change it</span>
	</a>
{/if}

<main class="flex flex-1 flex-col gap-6 px-5 pt-2 pb-28">
	{@render children()}
</main>

<AdminNav />
