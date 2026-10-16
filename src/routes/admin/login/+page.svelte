<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import Logo from '#lib/components/ui/Logo.svelte';
	import SubmitButton from '#lib/components/ui/SubmitButton.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let pending = $state(false);
</script>

<main class="flex flex-1 flex-col justify-center gap-10 px-6 py-10">
	<header class="flex flex-col items-center gap-3 text-center">
		<Logo size="lg" />
		<p class="text-sm text-taupe">Backstage</p>
	</header>

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
		<div>
			<label for="password" class="label">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				class="input"
				autocomplete="current-password"
				required
			/>
			{#if form?.error}<p class="mt-2 error-text">{form.error}</p>{/if}
		</div>
		<SubmitButton {pending}>Sign in</SubmitButton>
	</form>

	<a href={resolve('/login')} class="text-center text-xs text-taupe/70">Back</a>
</main>
