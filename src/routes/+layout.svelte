<script lang="ts">
	import favicon from '$lib/assets/favicon.svg'
	import '../app.scss'

	import debugFactory from 'debug'
	interface Props {
		children?: import('svelte').Snippet
	}
	let { children } = $props()
	const log = debugFactory('log')
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<div>
	<nav class="container">
		<h1>
			<a class="brand" href="/" data-sveltekit-reload
				><span class="icon">🚀</span><span class="title-text">MultiLaunch</span></a
			>
			<small><a href="/doc">Help&Tips</a></small>
		</h1>
	</nav>

	{@render children?.()}
</div>

<style>
	div {
		padding-left: calc(100vw - 100%);
		overflow-x: hidden;
		height: 100%;
	}

	.brand {
		color: var(--pico-primary);
		text-decoration: none;
	}

	.brand .icon {
		filter: grayscale(100%);
	}

	h1 {
		margin-bottom: 0;
	}
	small {
		font-size: 42%;
		font-weight: normal;
	}
</style>
