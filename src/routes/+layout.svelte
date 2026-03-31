<script lang="ts">
	import logoSvg from '/logo.svg'
	import '../app.scss'
	import { base } from '$app/paths'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" href="{base}/favicon.ico" sizes="32x32" />
	<link rel="icon" href="{base}/icon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="{base}/apple-touch-icon.png" />
	<link rel="manifest" href="{base}/manifest.webmanifest" />
</svelte:head>
<div>
	<nav class="container">
		<h1>
			<a class="brand" href="{base}/" data-sveltekit-reload
				><img src={logoSvg} alt="" width="24" height="24" /><span class="title-text"
					>MultiLaunch</span
				></a
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

	nav.container {
		padding-left: 0;
		padding-right: 0;
	}

	.brand {
		color: var(--nc-primary);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
	}

	h1 {
		margin-bottom: 0;
	}
	small {
		font-size: 42%;
		font-weight: normal;
	}
</style>
