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

		const lzPlan = compressToEncodedURIComponent(JSON.stringify(plan))

		return {
			name,
			target,
			lzPlan: lzPlan,
			getUrlTemplate,
			clickHandler: (event: Event, isClickAll = false) => {
				const e = event as MouseEvent

				let urlTemplate = getUrlTemplate(query)
				if (!isClickAll) {
					urlTemplate ||= plan.default
				}

				const queryTrimmedEncoded = encodeURIComponent(query.trim())
				const url = urlTemplate.replace('QUERY', queryTrimmedEncoded)

				const targetTabName = isClickAll || e.shiftKey || e.ctrlKey ? target : '_self'
				log('handleClick', targetTabName, e)
				if (url !== '') {
					window.open(url, targetTabName)
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
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			searchGroups[0].handleClickAll(e)
		}

		if (e.key === 'Escape') {
			e.preventDefault()
			query = ''
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
	{#if planToml}
		<details class="editor">
			<!-- svelte-ignore a11y-no-redundant-roles -->
			<summary role="button" class="contrast">
				<div>
					<span class:error={planError}>
						URL Launch Plan{#if planError}. {planError.name}: {planError.message}{/if}</span
					>
					<span>Edit</span>
				</div>
			</summary>
			<div>
				<button>Save as Current Plan</button>
				<button class="secondary">Append to Current Plan</button>
				<button class="secondary">Copy to Clipboard</button>
			</div>
			{#if planError}
				<div class="error">
					{planError.name}: {planError.message}
				</div>
			{/if}
			<pre>{planToml}</pre>
		</details>

		<a
			role="button"
			class="full-width secondary"
			href="/settings?plan={compressToEncodedURIComponent(planToml)}">Edit Plan</a
		>
	{/if}

	<form method="POST">
		<textarea
			placeholder="QUERY"
			rows="2"
			name="query"
			bind:value={query}
			bind:this={textArea}
			on:focus={handleFocus}
		/>
		{#each searchGroups as searchGroup}<div>
				<button on:click|preventDefault={searchGroup.handleClickAll}
					>@{searchGroup.name}</button
				>{#each searchGroup.engines as engine}<button
						class="secondary"
						name="lz-plan"
						value={engine.lzPlan}
						class:exclude-from-all={engine.getUrlTemplate(query) === ''}
						on:click|preventDefault={engine.clickHandler}>{engine.name}</button
					>{/each}
			</div>{/each}
	</form>
</main>

<style>
	form > div {
		margin-bottom: var(--spacing);
	}

	.error {
		color: red;
	}

	.exclude-from-all {
		opacity: 0.5;
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

	/* Custom styles for the editor */
	.editor > summary {
		margin-bottom: 0;
	}

	.editor > summary > div {
		display: inline-flex;
		justify-content: space-between;
		width: calc(100% - 1.5rem);
	}

	.editor > summary > div > span:first-child {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.editor > div > button {
		width: 100%;
		margin: 0;
		border-top: solid 1px var(--color);
		border-radius: 0;
	}

	.editor > div button:first-child {
		border-top-left-radius: var(--border-radius);
		border-top-right-radius: var(--border-radius);
	}
	.editor > div button:last-child {
		border-bottom: solid 1px var(--color);
		border-bottom-left-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
	}
</style>
