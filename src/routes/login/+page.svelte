<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import Logo from '#lib/components/ui/Logo.svelte';
	import SubmitButton from '#lib/components/ui/SubmitButton.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let pending = $state(false);
</script>

<main class="flex flex-1 flex-col justify-center gap-10 px-6 py-10">
	<header class="flex flex-col items-center gap-3 text-center">
		<Logo size="lg" />
		<p class="text-sm text-taupe">A little secret, just for you.</p>
	</header>

	{#if data.access.enabled}
		<form
			method="POST"
			class="flex flex-col gap-5 panel"
			use:enhance={() => {
				pending = true;
				return async ({ update }) => {
					await update();
					pending = false;
				};
			}}
		>
			<figure class="text-center">
				<figcaption class="label">Your riddle</figcaption>
				<blockquote class="font-serif text-xl leading-snug text-ink italic">
					“{data.access.hint}”
				</blockquote>
			</figure>

			<div>
				<label for="code" class="sr-only">Your answer</label>
				<input
					id="code"
					name="code"
					class="input text-center"
					placeholder="Your answer"
					autocomplete="off"
					autocapitalize="none"
					required
				/>
				{#if form?.error}<p class="mt-2 text-center error-text">{form.error}</p>{/if}
			</div>

			<SubmitButton {pending}>Open</SubmitButton>
		</form>
	{:else}
		<p class="panel text-center font-serif text-lg text-taupe italic">
			Not quite ready yet… come back soon.
		</p>
	{/if}

	<a href={resolve('/admin/login')} class="text-center text-xs text-taupe/70">Admin</a>
</main>
