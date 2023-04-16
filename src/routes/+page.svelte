<script lang="ts">
	import '../app.scss'

	import _ from 'lodash'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import TOML from '@ltd/j-toml'
	import lzString from 'lz-string'

	import type { ActionData, PageData } from './$types'

	import * as SE from '$lib/search-engines'

	// Data props:
	export let data: PageData
	export let form: ActionData

	// Bindings
	let query = ''

	let successMessages: string[] = []
	let errorMessages: string[] = []

	let planToml = form?.planToml || data.planToml
	let planJson: any
	let planTitle = 'Untitled'

	let searchGroups: SE.SearchGroup[] = []

	let failedToCopy = false

	if (form?.errorMessage) {
		errorMessages.push(form.errorMessage)
	}

	if (form?.successMessage) {
		successMessages.push(form.successMessage)
	}

	let open =
		successMessages.length || errorMessages.length || form?.fromEditOperation ? true : false

	const makeSearchEngine = (
		groupName: string,
		name: string,
		plan: SE.SearchEnginePlan
	): SE.SearchEngine => {
		const getUrlTemplate = SE.makeUrlTemplateSelector(plan)
		const target = plan.target || `${groupName}.${name}`
		const exclude = !!plan?.exclude

		const lzPlan = lzString.compressToEncodedURIComponent(JSON.stringify(plan))

		return {
			name,
			target,
			exclude,
			lzPlan: lzPlan,
			getUrlTemplate,
			clickHandler: (event: Event, isClickAll = false) => {
				const e = event as MouseEvent

				let urlTemplate = getUrlTemplate(query, isClickAll)

				const queryTrimmedEncoded = encodeURIComponent(query?.trim())
				const url = urlTemplate.replace('QUERY', queryTrimmedEncoded)

				const targetTabName = isClickAll || e.shiftKey || e.ctrlKey ? target : '_self'
				log('handleClick', targetTabName, e)
				if (!exclude || !isClickAll) {
					if (url !== '') {
						window.open(url, targetTabName)
					}
				}
			},
		}
	}

	const makeSearchGroups = (planJson: any) => {
		const { title, ...searchGroupPlans } = planJson as Record<string, SE.SearchGroupPlans>

		const searchGroups = _.map(searchGroupPlans, (plans: SE.SearchGroupPlans, name: string) =>
			SE.makeSearchGroup(name, plans, makeSearchEngine)
		)

		return searchGroups
	}

	try {
		planJson = TOML.parse(planToml)
		planTitle = planJson.title as string
		searchGroups = makeSearchGroups(planJson)
	} catch (error) {
		errorMessages.push((error as Error).message)
	}

	const handleClickShare = async (e: Event) => {
		try {
			TOML.parse(planToml)
		} catch (error) {
			const errorMessage = (error as Error).message
			errorMessages = [...errorMessages, errorMessage]
			return
		}

		if (!failedToCopy) {
			e.preventDefault()
			try {
				const origin = document.location.origin
				const planTomlLz = lzString.compressToEncodedURIComponent(planToml)
				const shareLink = `${origin}?p=${planTomlLz}`

				await navigator.clipboard.writeText(shareLink)
				const successMessage = `<a href="${shareLink}" data-sveltekit-reload>Sharing link</a> copied to clipboard.`
				successMessages = [...successMessages, successMessage]
			} catch (error) {
				console.error('Failed to copy: ', error)
				failedToCopy = true
				;(e.target as HTMLButtonElement).click()
			}
		}
	}

	const handleClickCopy = async (e: Event) => {
		try {
			TOML.parse(planToml)
		} catch (error) {
			const errorMessage = (error as Error).message
			errorMessages = [...errorMessages, errorMessage]
			return
		}

		e.preventDefault()
		try {
			await navigator.clipboard.writeText(planToml)
			const successMessage = `Plan TOML copied to clipboard.`
			successMessages = [...successMessages, successMessage]
		} catch (error) {
			console.error('Failed to copy: ', error)
			failedToCopy = true
		}
	}

	const handleTextareaInput = async (e: Event) => {
		successMessages = []
		errorMessages = []

		try {
			const planJson = TOML.parse(planToml)
			planTitle = planJson.title as string
			searchGroups = makeSearchGroups(planJson)
		} catch (error) {
			const errorMessage = (error as Error).message
			errorMessages = [...errorMessages, errorMessage]
			searchGroups = []
		}
	}
</script>

<main class="container">
	<form method="POST" action="?/edit">
		<details class="editor" {open}>
			<!-- svelte-ignore a11y-no-redundant-roles -->
			<summary role="button" class="contrast">
				<div>
					<span>{planTitle}</span>
					<span>Edit</span>
				</div>
			</summary>

			<article>
				<header>
					<div role="group">
						<button name="operation" value="save">Save</button><button
							class="secondary"
							name="operation"
							value="add">Add (Preview)</button
						><button
							class="secondary"
							name="operation"
							value="copy"
							on:click={handleClickCopy}>Copy</button
						><button
							class="secondary"
							name="operation"
							value="share"
							on:click={handleClickShare}>Share</button
						>
					</div>
					{#if successMessages.length}
						{#each successMessages.slice(-1) as successMessage}
							<blockquote>{@html successMessage}</blockquote>
						{/each}
					{/if}
					{#if errorMessages.length}
						<blockquote class="error">{errorMessages[0]}</blockquote>
					{/if}
					{#if !errorMessages.length && !successMessages.length}
						<blockquote style="visibility: hidden">Placeholder</blockquote>
					{/if}
				</header>
				<div class="wrap-textarea">
					<textarea
						name="planToml"
						rows="8"
						spellcheck="false"
						bind:value={planToml}
						on:input={handleTextareaInput}
					/>
				</div>
			</article>
		</details>
	</form>

	<form method="POST" action="?/launch" class="launcher">
		<div role="search" class="wrap-textarea">
			<textarea
				placeholder="QUERY"
				name="query"
				class="query"
				rows="1"
				spellcheck="false"
				bind:value={query}
			/>
		</div>

		{#each searchGroups as searchGroup}<div>
				<button on:click|preventDefault={searchGroup.handleClickAll}
					><span class="button-text"><span class="icon">⚡</span> {searchGroup.name}</span
					></button
				>{#each searchGroup.engines as engine}<button
						class="secondary"
						name="lz-plan"
						value={engine.lzPlan}
						class:exclude-from-all={engine.exclude ||
							!engine.getUrlTemplate(query, true)}
						data-tooltip={`${engine.name}\n${decodeURI(engine.getUrlTemplate(query))}`}
						on:click|preventDefault={engine.clickHandler}
						><span class="button-text"
							><span style:visibility={engine.exclude ? '' : 'hidden'}
								><span class="icon">🚫</span>
							</span>{engine.name}</span
						></button
					>{/each}
			</div>{/each}
	</form>

	<pre hidden>{JSON.stringify(planJson, null, 4)}</pre>

	<pre hidden>{JSON.stringify(makeSearchGroups(planJson), null, 4)}</pre>
</main>

<style>
	.error {
		color: red;
	}

	form > div {
		margin-bottom: var(--pico-spacing);
	}

	.exclude-from-all {
		/* TODO: Don't hardcode color */
		background-color: hsl(205 15% 41% / 0.5);
		border-bottom-color: hsl(205 15% 41% / 0.5);
		border-left-color: hsl(205 15% 41% / 0.5);
	}

	details header {
		margin-bottom: var(--pico-spacing);
	}

	details header {
		margin-right: calc(var(--pico-spacing) * -1);
		margin-left: calc(var(--pico-spacing) * -1);
		padding: var(--pico-spacing);
	}

	details > article {
		margin-top: 0;
		padding-right: var(--pico-spacing);
		padding-left: var(--pico-spacing);
	}

	main textarea {
		font-family: 'Menlo', 'Consolas', 'Roboto Mono', 'Ubuntu Monospace', 'Noto Mono',
			'Oxygen Mono', 'Liberation Mono', monospace, 'Apple Color Emoji', 'Segoe UI Emoji',
			'Segoe UI Symbol', 'Noto Color Emoji';
	}

	details textarea,
	.wrap-textarea {
		max-height: 40vh;
	}

	textarea.query {
		resize: none;

		overflow: hidden;

		padding-inline-start: calc(var(--pico-form-element-spacing-horizontal) + 1.75rem);

		background-color: white;
		background-image: var(--pico-icon-search);
		background-position: center left 1.125rem;
		background-size: 1rem auto;
		background-repeat: no-repeat;
	}

	div button {
		width: calc(100% / 2);

		border-right: 1px solid var(--pico-muted-border-color);
		border-top: 1px solid var(--pico-muted-border-color);
		border-radius: 0;

		margin: 0;

		/* Undo pico css button styling */
		display: inline;
	}

	div button .button-text {
		display: inline-block;
		width: 100%;

		overflow-x: clip;

		text-align: left;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.button-text .icon {
		filter: grayscale(100%);
	}

	div button:first-child {
		width: 100%;
	}

	@media (min-width: 576px) {
		div button {
			width: calc(100% / 3);
		}
	}
	@media (min-width: 768px) {
		div button:first-child,
		div button {
			width: calc(100% / 4);
		}
	}
	@media (min-width: 1024px) {
		div button:first-child,
		div button {
			width: calc(100% / 5);
		}
	}
	@media (min-width: 1280px) {
		div button:first-child,
		div button {
			width: calc(100% / 6);
		}
	}

	[data-tooltip]::before {
		text-align: left;
		white-space: pre;
	}

	.wrap-textarea:focus-within.fullscreen {
		display: flex;
		flex-direction: column;

		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;

		overflow: hidden;

		transition: background 200ms linear 0s;
	}
	main textarea {
		flex-grow: 1;

		white-space: pre;
		overflow-wrap: normal;
		overflow: scroll;

		transition: none;
	}

	.wordcount {
		display: none;
	}

	:global(:focus-within.fullscreen) .wordcount {
		display: block;
	}

	:global(body:has(.fullscreen textarea:focus)) {
		overflow-y: hidden;
	}

	.fullscreen textarea:focus,
	.wrap-textarea:focus-within.fullscreen {
		margin: 0;
		border: 0;
		border-radius: 0;
		z-index: 10000;

		overflow: auto;

		max-height: 100vh;
		background: var(--pico-background-color);
	}

	div[role='search'] {
		width: 100%;
	}

	details header {
		margin-bottom: var(--pico-spacing);
		margin-right: calc(var(--pico-spacing) * -1);
		margin-left: calc(var(--pico-spacing) * -1);
		padding: var(--pico-spacing);
	}

	details > article {
		padding-right: var(--pico-spacing);
		padding-left: var(--pico-spacing);
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

	.editor header div {
		width: 100%;
	}

	.editor header button {
		width: calc(100% / 4);
		border-left: 1px solid var(--pico-muted-border-color);
	}
</style>
