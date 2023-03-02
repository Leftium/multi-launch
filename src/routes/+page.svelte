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

	const isTextInputElement = (element: Element | null) => {
		if (element === null) {
			return false
		}

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
		const htmlInputElement = element as HTMLInputElement
		const tagName = htmlInputElement?.tagName?.toLowerCase()
		const type = htmlInputElement?.type?.toLowerCase()

		return tagName === 'textarea' || tagName === 'input' || TEXT_INPUT_TYPES.includes(type)
	}

	const makeSearchEngine = (
		groupName: string,
		name: string,
		plan: SE.SearchEnginePlan
	): SE.SearchEngine => {
		const getUrlTemplate = SE.makeUrlTemplateSelector(plan)
		const target = plan.target || `${groupName}.${name}`
		const exclude = !!plan?.exclude

		const lzPlan = compressToEncodedURIComponent(JSON.stringify(plan))

		return {
			name,
			target,
			exclude,
			lzPlan: lzPlan,
			getUrlTemplate,
			clickHandler: (event: Event, isClickAll = false) => {
				const e = event as MouseEvent

				let urlTemplate = getUrlTemplate(query, isClickAll)

				const queryTrimmedEncoded = encodeURIComponent(query.trim())
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
		if ((e.altKey || e.ctrlKey) && e.key === 'Enter') {
			e.preventDefault()
			searchGroups[0].handleClickAll(e)
		}

		if (e.shiftKey && ['Delete', 'Backspace'].includes(e.key)) {
			e.preventDefault()
			query = ''
		}

		if (
			textArea &&
			e.key !== 'Tab' &&
			!(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) &&
			!isTextInputElement(document.activeElement)
		) {
			textArea.focus()
		}
	}

	const handleTextareaKeydown = (e: KeyboardEvent) => {
		const parentElement = (e.target as HTMLTextAreaElement).parentElement
		if (e.key === 'Enter') {
			if (e.shiftKey) {
				e.preventDefault()
				parentElement?.classList.toggle('fullscreen')
			} else if ((e.target as HTMLTextAreaElement).classList.contains('query')) {
				parentElement?.classList.add('fullscreen')
			}
		}
	}

	const handlePaste = (e: ClipboardEvent) => {
		const text = e.clipboardData?.getData('text')
		if (text && !isTextInputElement(document.activeElement)) {
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
					<div class="wrap-textarea fullscreen">
						<textarea rows="80" spellcheck="false" on:keydown={handleTextareaKeydown}
							>{planToml}</textarea
						>
					</div>

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
		<div class="wrap-textarea">
			<textarea
				placeholder="QUERY"
				name="query"
				class="query"
				rows="1"
				spellcheck="false"
				bind:value={query}
				bind:this={textArea}
				on:focus={handleFocus}
				on:keydown={handleTextareaKeydown}
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
						data-tooltip={decodeURI(engine.getUrlTemplate(query))}
						on:click|preventDefault={engine.clickHandler}
						><span class="button-text"
							><span style:visibility={engine.exclude ? '' : 'hidden'}
								><span class="icon">🚫</span>
							</span>{engine.name}</span
						></button
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
		/* TODO: Don't hardcode color */
		background-color: hsl(205 15% 41% / 0.5);
		border-bottom-color: hsl(205 15% 41% / 0.5);
		border-left-color: hsl(205 15% 41% / 0.5);
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

	main textarea {
		font-family: 'Menlo', 'Consolas', 'Roboto Mono', 'Ubuntu Monospace', 'Noto Mono',
			'Oxygen Mono', 'Liberation Mono', monospace, 'Apple Color Emoji', 'Segoe UI Emoji',
			'Segoe UI Symbol', 'Noto Color Emoji';
	}

	details textarea,
	.wrap-textarea {
		max-height: 40vh;
		margin-bottom: 0;
	}

	textarea.query {
		border-radius: 5rem;
		resize: none;

		overflow: hidden;

		padding-inline-start: calc(var(--form-element-spacing-horizontal) + 1.75rem);

		background-color: white;
		background-image: var(--icon-search);
		background-position: center left 1.125rem;
		background-size: 1rem auto;
		background-repeat: no-repeat;
	}

	div button {
		width: calc(100% / 2);

		border-right: 1px solid var(--muted-border-color);
		border-top: 1px solid var(--muted-border-color);
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
	@media (min-width: 992px) {
		div button:first-child,
		div button {
			width: calc(100% / 5);
		}
	}
	@media (min-width: 1200px) {
		div button:first-child,
		div button {
			width: calc(100% / 6);
		}
	}

	.wrap-textarea:focus-within.fullscreen {
		transition: background 200ms linear 0s;
	}
	main textarea {
		transition: none;
	}

	.fullscreen textarea:focus,
	.wrap-textarea:focus-within.fullscreen {
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;

		margin: 0;
		border: 0;
		border-radius: 0;
		z-index: 10000;

		max-height: 100vh;
		background: var(--background-color);
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
