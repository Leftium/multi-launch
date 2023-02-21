<script lang="ts">
	import '@picocss/pico'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	import * as SE from '$lib/search-engines'
	import { config as DEFAULT_CONFIG } from '$lib/configs/default'

	// Bindings:
	let query = $page.url.searchParams.get('q') || ''
	let textArea: HTMLTextAreaElement

	// Generate click handlers bound to local `query`.
	const makeClickHandler = (urlTemplateOrSelector: SE.UrlTemplateOrSelector) => (e: Event) => {
		SE.makeClickHandler(query, urlTemplateOrSelector)(e)
	}

	const searchGroupConfigs = DEFAULT_CONFIG

	type SearchEngine = {
		name: string
		clickHandler: (e: Event) => void
	}

	type SearchGroup = {
		name: string
		engines: SearchEngine[]
		handleClickAll: (e: Event) => void
	}

	const makeSearchGroup = (groupName: string, configs: SE.SearchGroupConfig) => {
		const engines: SearchEngine[] = []
		for (const [name, config] of Object.entries(configs)) {
			engines.push(makeSearchEngine(name, config))
		}

		const handleClickAll = (e: Event) => {
			for (const searchEngine of engines) {
				searchEngine.clickHandler(e)
			}
		}

		return {
			name: groupName,
			engines,
			handleClickAll,
		}
	}

	const makeSearchEngine = (name: string, config: SE.SearchEngineConfig) => {
		const clickHandler = makeClickHandler(SE.selectUrl(config))

		return {
			name,
			clickHandler,
		}
	}

	const searchGroups: SearchGroup[] = []

	for (const [name, config] of Object.entries(searchGroupConfigs)) {
		searchGroups.push(makeSearchGroup(name, config.engines))
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
				<button class="secondary" on:click={engine.clickHandler}>{engine.name}</button>
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
		width: 6.96rem;
		margin: 0.1rem;

		font-size: 0.9rem;

		padding-left: 0.3rem;
		padding-right: 0.3rem;

		/* Undo pico css button styling */
		display: inline;
	}
</style>
