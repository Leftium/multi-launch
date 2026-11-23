<script lang="ts">
	import '../app.scss'
	import { page } from '$app/state'
	import BrandHeader from '#lib/BrandHeader.svelte'

	let { children } = $props()
</script>

<div>
	{#if page.route.id !== '/'}
		<BrandHeader />
	{/if}

	{@render children?.()}
</div>

<style>
	div {
		height: 100%;
	}
</style>
