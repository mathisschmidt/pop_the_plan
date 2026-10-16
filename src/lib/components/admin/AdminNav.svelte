<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';

	const LINKS = [
		{ href: '/admin/(app)', label: 'Overview', icon: 'home' },
		{ href: '/admin/(app)/rings', label: 'Rings', icon: 'ring' },
		{ href: '/admin/(app)/rings/new', label: 'Add', icon: 'plus' },
		{ href: '/admin/(app)/settings', label: 'Settings', icon: 'settings' }
	] as const satisfies readonly { href: string; label: string; icon: IconName }[];

	// Match on the route id; the most specific link wins ("/rings/new" does not light up "Rings").
	const active = $derived(
		LINKS.filter(({ href }) => page.route.id?.startsWith(href)).sort(
			(a, b) => b.href.length - a.href.length
		)[0]?.href
	);
</script>

<nav
	class="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-line bg-pearl/90 pb-[env(safe-area-inset-bottom)] backdrop-blur"
>
	<ul class="grid grid-cols-4">
		{#each LINKS as link (link.href)}
			<li>
				<a
					href={resolve(link.href)}
					class={[
						'flex flex-col items-center gap-1 py-3 text-[11px] font-medium',
						active === link.href ? 'text-rose' : 'text-taupe'
					]}
					aria-current={active === link.href ? 'page' : undefined}
				>
					<Icon name={link.icon} class="size-6" />
					{link.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
