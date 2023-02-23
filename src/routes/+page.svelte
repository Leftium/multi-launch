<script lang="ts">
	import '@picocss/pico'

	import _ from 'lodash'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	import * as SE from '$lib/search-engines'
	import DEFAULT_CONFIGS from '$lib/configs/default.toml'

	// Bindings:
	let query = $page.url.searchParams.get('q') || ''
	let textArea: HTMLTextAreaElement

	const makeSearchEngine = (name: string, config: SE.SearchEngineConfig): SE.SearchEngine => {
		const getUrlTemplate = SE.makeUrlTemplateSelector(config)
		return {
			name,
			getUrlTemplate,
			clickHandler: (e: Event) => {
				const urlTemplate = getUrlTemplate(query)
				const queryTrimmedEncoded = encodeURIComponent(query.trim())
				const url = urlTemplate.replace('QUERY', queryTrimmedEncoded)

				log('handleClick', url, e)

				if (url !== '') {
					window.open(url, '_blank')
				}
			},
		}
	}

	const searchGroupConfigs = DEFAULT_CONFIGS as Record<string, SE.SearchGroupConfigs>

	const searchGroups = _.map(searchGroupConfigs, (configs: SE.SearchGroupConfigs, name: string) =>
		SE.makeSearchGroup(name, configs, makeSearchEngine)
	)

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
	<title>MultiLaunch{query ? ` — ${query}` : ''}</title>
</svelte:head>

<svelte:body on:paste={handlePaste} />

<main class="container">
	<h1>
		MultiLaunch <small><a href="/doc">Help & Tips</a></small>
	</h1>

	<textarea
		placeholder="QUERY"
		rows="2"
		bind:value={query}
		bind:this={textArea}
		on:focus={handleFocus}
	/>

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
