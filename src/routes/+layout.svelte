<script lang="ts">
	import { favicon } from '@leftium/logo'
	import '../app.scss'
	import { base } from '$app/paths'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<div>
	<nav class="container">
		<h1>
			<a class="brand" href="{base}/" data-sveltekit-reload
				><span class="icon">🚀</span><span class="title-text">MultiLaunch</span></a
			>
			<small><a href="{base}/doc">Help&Tips</a></small>
		</h1>
	</nav>

	{@render children?.()}
</div>

<style>
	div {
		height: 100%;
	}

	.brand {
		color: var(--nc-primary);
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
