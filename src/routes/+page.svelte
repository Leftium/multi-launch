<script lang="ts">
	import _ from 'lodash'

	import toml from 'toml-js'
	import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	import * as SE from '$lib/search-engines'
	import DEFAULT_CONFIGS from '$lib/configs/default.toml'

	import { didBeforeNavigate } from '$lib/stores'

	// Bindings:
	let query = $page.url.searchParams.get('q') || ''
	let textArea: HTMLTextAreaElement

	let configToml =
		decompressFromEncodedURIComponent($page.url.searchParams.get('config') || '') || ''

	let configJson
	let configError: Error

	try {
		configJson = toml.parse(configToml)
	} catch (error) {
		configError = error as Error
	}

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

	const searchGroupConfigs = ((configToml && configJson) || DEFAULT_CONFIGS) as Record<
		string,
		SE.SearchGroupConfigs
	>

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
		if (textArea) {
			textArea.focus()
		}

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
	{#if configError}
		<details open={$didBeforeNavigate}>
			<!-- svelte-ignore a11y-no-redundant-roles -->
			<summary role="button" class="error contrast"
				>There was an error parsing the config!
				{configError.name}: {configError.message}</summary
			>
			<pre>{configToml}</pre>
		</details>
		<a
			role="button"
			class="full-width"
			href="/settings?config={compressToEncodedURIComponent(configToml)}">Edit Config</a
		>
	{:else}
		{#if configToml}
			<details open={$didBeforeNavigate}>
				<!-- svelte-ignore a11y-no-redundant-roles -->
				<summary role="button" class="contrast">Previewing Config:</summary>
				<pre>{configToml}</pre>

				<button>Save (Replace Current Settings)</button>
				<button class="secondary">Add to Settings</button>
				<a
					role="button"
					class="full-width secondary"
					href="/settings?config={encodeURIComponent(configToml)}">Edit Config</a
				>
				<button class="secondary">Copy to Clipboard</button>
			</details>
		{/if}

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
	{/if}
</main>

<style>
	main > div {
		margin-bottom: var(--spacing);
	}

	.error {
		color: red;
	}

	.full-width {
		width: 100%;
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
