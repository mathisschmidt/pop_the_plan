<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import PictureForm from '#lib/components/pictures/PictureForm.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { toast } from '#lib/components/ui/Toast.svelte';
	import { CATEGORY_META } from '#lib/domain/category.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const back = $derived(resolve('/swipe/[category=category]', { category: data.category }));
</script>

<div class="flex flex-1 flex-col">
	<header class="flex items-center px-3 py-3">
		<a
			href={back}
			class="grid size-10 place-items-center rounded-full text-taupe active:bg-line"
			aria-label="Back"
		>
			<Icon name="back" class="size-6" />
		</a>
	</header>

	<main class="flex flex-col gap-5 px-5 pb-8">
		<div class="flex flex-col gap-2">
			<h1 class="text-3xl italic">{CATEGORY_META[data.category].shareTitle}</h1>
			<p class="text-taupe">Show me, I will keep it with the ones you love.</p>
		</div>

		<PictureForm
			remoteEndpoint={resolve('/swipe/remote')}
			submitLabel="I love it"
			onsaved={() => {
				toast('Noted ♥');
				goto(back, { replaceState: true });
			}}
		/>
	</main>
</div>
