<script lang="ts">
	import { asset, resolve } from '$app/paths'
	import type { Snippet } from 'svelte'

	let { actions }: { actions?: Snippet } = $props()
</script>

<nav class="container">
	<h1>
		<a class="brand" href={resolve('/')} data-sveltekit-reload
			><img src={asset('logo.svg')} alt="" width="24" height="24" /><span class="title-text"
				>MultiLaunch</span
			></a
		>
		<small><a href={resolve('/doc')}>Help&Tips</a></small>
	</h1>
	{#if actions}
		<div class="actions">
			{@render actions()}
		</div>
	{/if}
</nav>

<style>
	nav.container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding-inline: 0;
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

	.actions {
		flex-shrink: 0;
		white-space: nowrap;
	}
</style>
