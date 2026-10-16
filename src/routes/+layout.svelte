<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import Toast from '#lib/components/ui/Toast.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>Pop the Plan</title>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href={favicon} />
</svelte:head>

<div
	class="mx-auto flex min-h-dvh max-w-md flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
>
	{@render children()}
</div>

<Toast />
