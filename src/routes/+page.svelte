<script lang="ts">
	import '@picocss/pico'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	import * as SE from '$lib/search-engines'
	import DEFAULT_CONFIGS from '$lib/configs/default.toml'

	// Bindings:
	let query = $page.url.searchParams.get('q') || ''
	let textArea: HTMLTextAreaElement

	// Generate click handlers bound to local `query`.
	const makeEngineFunctions = (urlTemplateOrSelector: SE.UrlTemplateSelector) => {
		return {
			getUrlTemplate: SE.makeEngineFunctions(query, urlTemplateOrSelector).getUrlTemplate,
			clickHandler: (e: Event) => {
				SE.makeEngineFunctions(query, urlTemplateOrSelector).clickHandler(e)
			},
		}
	}

	const searchGroupConfigs = DEFAULT_CONFIGS as Record<string, SE.SearchGroupConfig>

	const searchGroups: SE.SearchGroup[] = []

	for (const [name, config] of Object.entries(searchGroupConfigs)) {
		searchGroups.push(SE.makeSearchGroup(name, config, makeEngineFunctions))
	}

	const handleFocus = (e: Event) => {
		textArea.select()
	}

	const handleKeydown = (e: KeyboardEvent) => {
		log('handleKeydown', e)

		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			searchGroups[0].handleClickAll(e)
		}
	}

	const handlePaste = (e: ClipboardEvent) => {
		let text = e.clipboardData?.getData('text')
		log('handlePaste', text, e)
		if (text) {
			e.preventDefault()
			query = text
		}
	}

	onMount(() => {
		textArea.focus()

		window.addEventListener('keydown', handleKeydown)

		return () => {
			window.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

<svelte:head>
	<title>MultiSearch{query ? ` — ${query}` : ''}</title>
</svelte:head>

<svelte:body on:paste={handlePaste} />

<main class="container">
	<h1>
		MultiSearch <small><a href="/doc">Help & Tips</a></small>
	</h1>

	<textarea rows="2" bind:value={query} bind:this={textArea} on:focus={handleFocus} />

	{#each searchGroups as searchGroup}
		<div>
			<button on:click={searchGroup.handleClickAll}>All {searchGroup.name}</button
			>{#each searchGroup.engines as engine}
				<button
					class="secondary"
					on:click={engine.clickHandler}
					disabled={engine.getUrlTemplate(query) === ''}>{engine.name}</button
				>
			{/each}
		</div>
	{/each}
</main>

<style>
	h1 {
		margin-bottom: 0;
	}

	small {
		font-size: 42%;
		font-weight: normal;
	}

	main > div {
		margin-bottom: var(--spacing);
	}

	div button {
		width: 6.94rem;
		margin: 0.1rem;

		font-size: 0.9rem;
		white-space: nowrap;

		padding-left: 0.3rem;
		padding-right: 0.3rem;

		/* Undo pico css button styling */
		display: inline;
	}
</style>
