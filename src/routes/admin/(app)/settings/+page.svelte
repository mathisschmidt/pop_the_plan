<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '$app/forms';
	import FormMessage from '#lib/components/ui/FormMessage.svelte';
	import SubmitButton from '#lib/components/ui/SubmitButton.svelte';
	import { GUEST_HINT_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '#lib/domain/auth.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let pending = $state<string | null>(null);

	/** Tracks which form is submitting; `reset` clears sensitive fields after success. */
	const submitting =
		(name: string, reset = true): SubmitFunction =>
		({ action, cancel }) => {
			if (action.search.includes('guestDisable') && !confirm('Close her access?')) return cancel();
			pending = name;
			return async ({ update }) => {
				await update({ reset });
				pending = null;
			};
		};
</script>

<h1 class="text-3xl">Settings</h1>

<section class="flex flex-col gap-4 panel">
	<header>
		<h2 class="text-xl">Her secret code</h2>
		<p class="text-sm text-taupe">
			She sees the riddle, then types the answer. Case, accents and punctuation are ignored.
		</p>
	</header>

	<form
		method="POST"
		action="?/guest"
		class="flex flex-col gap-4"
		use:enhance={submitting('guest')}
	>
		<div>
			<label for="hint" class="label">Riddle she will see</label>
			<textarea
				id="hint"
				name="hint"
				class="textarea"
				maxlength={GUEST_HINT_MAX_LENGTH}
				placeholder="Where did we have our first coffee?"
				required>{data.guestAccess.hint ?? ''}</textarea
			>
		</div>
		<div>
			<label for="code" class="label">Answer (the code)</label>
			<input
				id="code"
				name="code"
				class="input"
				autocomplete="off"
				placeholder={data.guestAccess.enabled
					? '•••••• (type a new one to change it)'
					: 'Café de Flore'}
				required
			/>
		</div>
		<FormMessage result={form?.guest} />
		<SubmitButton pending={pending === 'guest'}>Save code</SubmitButton>
	</form>

	{#if data.guestAccess.enabled}
		<form method="POST" class="grid grid-cols-2 gap-3" use:enhance={submitting('guestOther')}>
			<button
				formaction="?/guestSignOut"
				class="btn-secondary px-3 text-xs"
				disabled={!data.guestDevices}
			>
				Sign her out ({data.guestDevices})
			</button>
			<button formaction="?/guestDisable" class="btn-secondary px-3 text-xs text-rose">
				Close access
			</button>
		</form>
	{/if}
</section>

<section class="flex flex-col gap-4 panel">
	<h2 class="text-xl">My password</h2>
	<form
		method="POST"
		action="?/password"
		class="flex flex-col gap-4"
		use:enhance={submitting('password')}
	>
		<div>
			<label for="current" class="label">Current</label>
			<input
				id="current"
				name="current"
				type="password"
				class="input"
				autocomplete="current-password"
				required
			/>
		</div>
		<div>
			<label for="next" class="label">New</label>
			<input
				id="next"
				name="next"
				type="password"
				class="input"
				autocomplete="new-password"
				minlength={PASSWORD_MIN_LENGTH}
				required
			/>
		</div>
		<div>
			<label for="confirmation" class="label">Confirm new</label>
			<input
				id="confirmation"
				name="confirmation"
				type="password"
				class="input"
				autocomplete="new-password"
				minlength={PASSWORD_MIN_LENGTH}
				required
			/>
		</div>
		<FormMessage result={form?.password} />
		<SubmitButton pending={pending === 'password'}>Update password</SubmitButton>
	</form>
</section>
