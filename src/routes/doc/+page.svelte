<script lang="ts">
	import '@picocss/pico'
	import Doc from './doc.md'
</script>

<svelte:head>
	<title>Help & Tips — MultiSearch</title>
</svelte:head>

<main class="container">
	<Doc />
</main>

<style>
	:global(h1, h2, h3, h4, h5) {
		margin-top: 0 !important;
		margin-bottom: 0 !important;
	}
</style>
