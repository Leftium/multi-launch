<script lang="ts">
	import _ from 'lodash'

	import TOML from '@ltd/j-toml'

	import lzString from 'lz-string'
	const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = lzString

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	import * as SE from '$lib/search-engines'
	import DEFAULT_PLANS from '$lib/plans/default.toml'

	import { didBeforeNavigate } from '$lib/stores'

	// Bindings:
	let query = $page.url.searchParams.get('q') || ''
	let textArea: HTMLTextAreaElement

	let planToml = decompressFromEncodedURIComponent($page.url.searchParams.get('plan') || '') || ''

	let planJson
	let planError: Error

	try {
		planJson = TOML.parse(planToml)
	} catch (error) {
		planError = error as Error
	}

	const makeSearchEngine = (
		groupName: string,
		name: string,
		plan: SE.SearchEnginePlan
	): SE.SearchEngine => {
		const getUrlTemplate = SE.makeUrlTemplateSelector(plan)
		const target = plan.target || `${groupName}.${name}`

		return {
			name,
			target,
			getUrlTemplate,
			clickHandler: (e: Event) => {
				const urlTemplate = getUrlTemplate(query)
				const queryTrimmedEncoded = encodeURIComponent(query.trim())
				const url = urlTemplate.replace('QUERY', queryTrimmedEncoded)

				log('handleClick', url, e)

				if (url !== '') {
					window.open(url, target)
				}
			},
		}
	}

	const searchGroupPlans = ((planToml && planJson) || DEFAULT_PLANS) as Record<
		string,
		SE.SearchGroupPlans
	>

	const searchGroups = _.map(searchGroupPlans, (plans: SE.SearchGroupPlans, name: string) =>
		SE.makeSearchGroup(name, plans, makeSearchEngine)
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
	{#if planError}
		<details open={$didBeforeNavigate}>
			<!-- svelte-ignore a11y-no-redundant-roles -->
			<summary role="button" class="error contrast"
				>There was an error parsing the launch plan!
				{planError.name}: {planError.message}</summary
			>
			<pre>{planToml}</pre>
		</details>
		<a
			role="button"
			class="full-width"
			href="/settings?plan={compressToEncodedURIComponent(planToml)}">Edit Plan</a
		>
	{:else}
		{#if planToml}
			<details open={$didBeforeNavigate}>
				<!-- svelte-ignore a11y-no-redundant-roles -->
				<summary role="button" class="contrast">Previewing Launch Plans:</summary>
				<pre>{planToml}</pre>

				<button>Save (Replace Current Settings)</button>
				<button class="secondary">Add to Settings</button>
				<a
					role="button"
					class="full-width secondary"
					href="/settings?plan={compressToEncodedURIComponent(planToml)}">Edit Plan</a
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

		{#each searchGroups as searchGroup}<div>
				<button on:click={searchGroup.handleClickAll}>@{searchGroup.name}</button
				>{#each searchGroup.engines as engine}<button
						class="secondary"
						on:click={engine.clickHandler}
						disabled={engine.getUrlTemplate(query) === ''}>{engine.name}</button
					>{/each}
			</div>{/each}
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

	details pre {
		max-height: 40vh;
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
