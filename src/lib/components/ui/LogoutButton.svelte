<script lang="ts">
	import Icon from './Icon.svelte';
</script>

<form method="POST" action="/logout">
	<button
		class="grid size-10 place-items-center rounded-full text-taupe active:bg-line"
		aria-label="Sign out"
	>
		<Icon name="logout" />
	</button>
</form>
