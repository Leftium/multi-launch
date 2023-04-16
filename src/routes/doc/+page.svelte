<script lang="ts">
	import Markdown from './markdown.md'
</script>

<svelte:head>
	<title>Help & Tips — MultiLaunch</title>
</svelte:head>

<main class="container">
	<Markdown />
</main>

<style>
	main :global(h1),
	main :global(h2),
	main :global(h3),
	main :global(h4),
	main :global(h5),
	main :global(h6) {
		margin-top: 0;
		margin-bottom: 0;
	}
</style>
