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

	const TEXT_INPUT_TYPES = [
		'text',
		'password',
		'number',
		'email',
		'tel',
		'url',
		'search',
		'date',
		'datetime',
		'datetime-local',
		'time',
		'month',
		'week',
	]

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

		if (textArea) {
			const activeElement = document.activeElement as HTMLInputElement
			const tagName = activeElement?.tagName?.toLowerCase()
			const type = activeElement?.type?.toLowerCase()
			if (tagName !== 'textarea' && tagName !== 'input' && !TEXT_INPUT_TYPES.includes(type)) {
				textArea.focus()
			}
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
		<form method="POST" action="?/edit">
			<details class="editor" open>
				<!-- svelte-ignore a11y-no-redundant-roles -->
				<summary role="button" class="contrast">
					<div>
						<span>
							URL Launch Plan{#if planError}:
								<span class="error">
									{planError.name}!
								</span>
							{/if}
						</span>
						<span>Edit</span>
					</div>
				</summary>

				<article>
					<header>
						<div>
							<button>Save</button><button class="secondary">Append</button><button
								class="secondary">Copy</button
							>
						</div>
					</header>
					{#if planError}
						<header class="error">
							<div>
								{planError.name}: {planError.message}
							</div>
						</header>
					{/if}
					<textarea rows="40">{planToml}</textarea>
					<footer
						style:margin-top="var(--spacing)"
						style:padding="var(--spacing);"
						style:margin-bottom="var(--spacing);"
					>
						<a
							role="button"
							class="full-width secondary"
							href="/settings?plan={compressToEncodedURIComponent(planToml)}"
							style:margin-bottom="0">Edit Plan</a
						>
					</footer>
				</article>
			</details>
		</form>
	{/if}

	<form method="POST" action="?/launch">
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

	details header {
		margin-bottom: var(--spacing);
	}

	details header,
	details footer {
		margin-right: calc(var(--spacing) * -1);
		margin-left: calc(var(--spacing) * -1);
		padding: var(--spacing);
	}

	details > article {
		margin-top: 0;
		padding-right: var(--spacing);
		padding-left: var(--spacing);
	}

	details textarea {
		max-height: 40vh;
		margin-bottom: 0;
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

	.editor header button {
		display: inline;
		width: calc(100% / 3);
		margin: 0;
		border-left: 1px solid var(--muted-border-color);
		border-radius: 0;
	}

	.editor header button:first-child {
		border-left: none;
		border-top-left-radius: var(--border-radius);
		border-bottom-left-radius: var(--border-radius);
	}
	.editor header button:last-child {
		border-right: none;
		border-top-right-radius: var(--border-radius);
		border-bottom-right-radius: var(--border-radius);
	}
</style>
