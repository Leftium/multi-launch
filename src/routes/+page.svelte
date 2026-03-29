<script lang="ts">
	import { preventDefault } from 'svelte/legacy'

	import '../app.scss'

	import tippy from 'tippy.js'
	import 'tippy.js/dist/tippy.css'
	import type { Attachment } from 'svelte/attachments'

	import _ from 'lodash'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import TOML from '@ltd/j-toml'
	import lzString from 'lz-string'
	import 'iconify-icon'

	import type { ActionData, PageData } from './$types'

	function tooltip(content: string): Attachment {
		return (element) => {
			const instance = tippy(element, {
				content,
				placement: 'bottom',
				allowHTML: false,
			})
			return instance.destroy
		}
	}

	import * as SE from '$lib/search-engines'
	import { onMount } from 'svelte'
	import { page } from '$app/stores'

	interface Props {
		// Data props:
		data: PageData
		form: ActionData
	}

	let { data, form }: Props = $props()

	// Bindings
	let query = $state(form?.query || $page.url.searchParams.get('q') || '')
	let textArea: HTMLTextAreaElement = $state()

	let wrapTextarea: HTMLElement = $state()

	let successMessages: string[] = $state([])
	let errorMessages: string[] = $state([])

	let planToml = $state(form?.planToml || data.planToml)
	let planJson: any = $state()
	let planTitle = $state('Untitled')

	let searchGroups: SE.SearchGroup[] = $state([])

	let failedToCopy = false

	if (form?.errorMessage) {
		errorMessages.push(form.errorMessage)
	}

	if (form?.successMessage) {
		successMessages.push(form.successMessage)
	}

	let open =
		successMessages.length || errorMessages.length || form?.fromEditOperation ? true : false

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

		const engine = {
			name,
			target,
			exclude,
			plan,
		}

		const lzEngines = lzString.compressToEncodedURIComponent(JSON.stringify([engine]))

		return {
			...engine,
			lzEngines,
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

	const unhideIfJavascript = (node: HTMLElement) => {
		node.hidden = false
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

	const handleFocus = (e: Event) => {
		textArea.select()
	}

	const handleBlur = (e: Event) => {
		wrapTextarea.classList.remove('fullscreen')
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

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.shiftKey && ['Delete', 'Backspace'].includes(e.key)) {
			e.preventDefault()
			query = ''
			textArea.parentElement?.classList.remove('fullscreen')
			textArea.focus()
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
		if (e.key === 'Enter') {
			if (e.ctrlKey && e.shiftKey && e.altKey) {
				e.preventDefault()
				wrapTextarea?.classList.toggle('fullscreen')
			} else if (!wrapTextarea?.classList.contains('fullscreen')) {
				// Emulate clicking first category button
				searchGroups[0].handleClickAll(e, true)
				e.preventDefault()
			}
		}

		if (e.key === 'Escape') {
			e.stopPropagation()
			wrapTextarea?.classList.remove('fullscreen')
			textArea.blur()
		}
	}

	const handlePaste = (e: ClipboardEvent) => {
		const text = e.clipboardData?.getData('text')
		if (text && !isTextInputElement(document.activeElement)) {
			e.preventDefault()
			query = text
		}
	}

	const handleToggleFullscreen = (e: MouseEvent) => {
		log('handleToggleFullscreen')
		wrapTextarea.classList.toggle('fullscreen')
	}

	const makeClickAllHandler = (clickAllHandler: SE.LaunchButtonClickHandler, index: number) => {
		return (e: MouseEvent) => {
			if (e.altKey) {
				// Move clicked launch group to top.
				searchGroups.unshift(searchGroups.splice(index, 1)[0])
				searchGroups = searchGroups
			} else {
				clickAllHandler(e, false)
			}
		}
	}

	onMount(() => {
		let height = window.visualViewport?.height || 0
		const viewport = window.visualViewport

		function resizeHandler() {
			if (!/iPhone|iPad|iPod/.test(window.navigator.userAgent)) {
				height = viewport?.height || 0
			}
			wrapTextarea.style.bottom = `${height - (viewport?.height || 0)}px`
		}

		window.visualViewport?.addEventListener('resize', resizeHandler)

		window.addEventListener('keydown', handleKeydown)

		return () => {
			window.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

<svelte:body onpaste={handlePaste} />

<main class="container">
	<form method="POST" action="?/edit">
		<details class="editor" {open}>
			<!-- svelte-ignore a11y_no_redundant_roles -->
			<summary role="button" class="secondary">
				<div>
					<span>{planTitle}</span>
					<span>Edit</span>
				</div>
			</summary>

			<article>
				<header>
					<div role="group">
						<button name="operation" value="save"
							><span class="button-text">Save</span></button
						><button class="secondary" name="operation" value="add"
							><span class="button-text">Add (Preview)</span></button
						><button
							class="secondary"
							name="operation"
							value="copy"
							onclick={handleClickCopy}><span class="button-text">Copy</span></button
						><button
							class="secondary"
							name="operation"
							value="share"
							onclick={handleClickShare}
							><span class="button-text">Share</span></button
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
						oninput={handleTextareaInput}
					></textarea>
				</div>
			</article>
		</details>
	</form>

	<form method="POST" action="?/launch" class="launcher">
		<div class="wrap-textarea" bind:this={wrapTextarea}>
			<div class="wrap">
				<textarea
					placeholder="QUERY"
					name="query"
					class="query"
					rows="1"
					spellcheck="false"
					bind:value={query}
					bind:this={textArea}
					onkeydown={handleTextareaKeydown}
					onfocus={handleFocus}
					onblur={handleBlur}
				></textarea>

				<iconify-icon
					icon="material-symbols:fullscreen"
					class="icon"
					width="16"
					onclick={handleToggleFullscreen}
				></iconify-icon>
			</div>

			<div class="textarea-statusbar">
				<span hidden use:unhideIfJavascript>
					<span>Chars:</span><span>{query?.trim().length}</span>
					<span>Words:</span><span>{query?.split(/\S+/).length - 1}</span>
				</span>
				<iconify-icon
					icon="material-symbols:fullscreen-exit"
					class="icon"
					width="24"
					onclick={handleToggleFullscreen}
				></iconify-icon>
			</div>
		</div>

		{#each searchGroups as searchGroup, index}<div class="search-group">
				<button
					onclick={preventDefault(makeClickAllHandler(searchGroup.handleClickAll, index))}
					><span class="button-text"><span class="icon">⚡</span>{searchGroup.name}</span
					></button
				>{#each searchGroup.engines as engine}<button
						class="secondary"
						name="lz-engines"
						value={engine.lzEngines}
						class:exclude-from-all={engine.exclude ||
							!engine.getUrlTemplate(query, true)}
						{@attach tooltip(
							`${engine.name}\n${decodeURI(engine.getUrlTemplate(query))}`
						)}
						onclick={preventDefault(engine.clickHandler)}
						><span class="button-text">{engine.name}</span></button
					>{/each}
			</div>{/each}
	</form>

	<pre hidden>{JSON.stringify(form?.urls, null, 4)}</pre>

	<pre hidden>{JSON.stringify(planJson, null, 4)}</pre>

	<pre hidden>{JSON.stringify(makeSearchGroups(planJson), null, 4)}</pre>
</main>

<style>
	.wrap {
		position: relative;
	}

	.wrap textarea {
		margin-bottom: 0;
	}

	.wrap iconify-icon {
		position: absolute;
		/* Align to textarea content box: 1px border + 0.5em padding-top + half of 1.5 line-height */
		top: calc(1px + 0.5em + 0.75em);
		transform: translateY(-50%);
		right: 1.125rem;
	}

	:global(.fullscreen) .wrap iconify-icon {
		display: none;
	}

	.textarea-statusbar .icon {
		float: right;
	}

	.button-text .icon {
		filter: grayscale(100%);
	}

	.error {
		color: red;
	}

	form > div.search-group {
		margin-bottom: var(--nc-spacing);
	}

	.exclude-from-all {
		/* TODO: Don't hardcode color */
		background-color: hsl(205 15% 41% / 0.5);
		border-bottom-color: hsl(205 15% 41% / 0.5);
		border-left-color: hsl(205 15% 41% / 0.5);
	}

	.exclude-from-all:hover {
		background-color: hsl(205 15% 41% / 0.65);
	}

	details header {
		margin-bottom: var(--nc-spacing);
	}

	details header {
		margin-right: calc(var(--nc-spacing) * -1);
		margin-left: calc(var(--nc-spacing) * -1);
		padding: var(--nc-spacing);
	}

	details > article {
		margin-top: 0;
		padding-right: var(--nc-spacing);
		padding-left: var(--nc-spacing);
	}

	main textarea {
		font-family:
			'Menlo', 'Consolas', 'Roboto Mono', 'Ubuntu Monospace', 'Noto Mono', 'Oxygen Mono',
			'Liberation Mono', monospace, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
			'Noto Color Emoji';
	}

	textarea.query {
		border-radius: 5rem;
		resize: none;

		overflow: hidden;

		padding-inline-start: calc(0.75em + 1.75rem);

		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='rgb(136, 145, 164)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cline x1='21' y1='21' x2='16.65' y2='16.65'%3E%3C/line%3E%3C/svg%3E");
		background-position: center left 1.125rem;
		background-size: 1rem auto;
		background-repeat: no-repeat;
	}

	.search-group button {
		width: calc(100% / 2);

		border: none;
		border-top: 1px solid var(--nc-border);
		border-radius: 0;

		margin: 0;

		display: inline;
	}

	/* Partial dividers between same-type (secondary) buttons in the search grid */
	.search-group button.secondary + button.secondary {
		background-image: linear-gradient(
			to bottom,
			transparent 20%,
			rgb(255 255 255 / 0.3) 20%,
			rgb(255 255 255 / 0.3) 80%,
			transparent 80%
		);
		background-size: 1px 100%;
		background-repeat: no-repeat;
		background-position: left;
	}

	/* Hide divider when adjacent buttons have different bg colors */
	.search-group button.secondary.exclude-from-all + button.secondary:not(.exclude-from-all),
	.search-group button.secondary:not(.exclude-from-all) + button.secondary.exclude-from-all {
		background-image: none;
	}

	.search-group button .button-text {
		overflow-x: clip;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.launcher button .button-text {
		display: inline-block;
		width: 100%;
		text-align: left;
	}

	.search-group button:first-child {
		width: 100%;
	}

	/* Tablet */
	@media (min-width: 720px) {
		.search-group button:first-child,
		.search-group button {
			width: calc(100% / 4);
		}
	}
	/* Desktop (content maxes at 960px) */
	@media (min-width: 960px) {
		.search-group button:first-child,
		.search-group button {
			width: calc(100% / 6);
		}
	}

	main :global(.wrap-textarea.fullscreen) {
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
	main .wrap {
		flex-grow: 1;
	}

	main textarea {
		height: 100%;

		white-space: pre;
		overflow-wrap: normal;
		overflow: scroll;

		transition: none;
	}

	.textarea-statusbar {
		display: none;
		background-color: var(--nc-surface-2);
	}

	:global(.fullscreen) .textarea-statusbar {
		display: block;
	}

	:global(body:has(.fullscreen textarea)) {
		overflow-y: hidden;
	}

	:global(.fullscreen) textarea,
	:global(.wrap-textarea.fullscreen) {
		margin: 0;
		border: 0;
		border-radius: 0;
		z-index: 10000;

		overflow: auto;

		max-height: 100vh;
		background: var(--nc-surface-1);
	}

	:global(.fullscreen) textarea {
		padding-inline-start: 1em;
	}

	details header {
		margin-bottom: var(--nc-spacing);
		margin-right: calc(var(--nc-spacing) * -1);
		margin-left: calc(var(--nc-spacing) * -1);
		padding: var(--nc-spacing);
	}

	details > article {
		padding-right: var(--nc-spacing);
		padding-left: var(--nc-spacing);
	}

	/* Custom styles for the editor */
	.editor > article {
		border: none;
	}

	.editor > article > header {
		margin: 0;
		padding: 0;
		padding-bottom: var(--nc-spacing);
		border-bottom: none;
		background: none;
	}

	.editor > article > header [role='group'] {
		margin-bottom: 0;
	}

	.editor > article > header blockquote[style*='hidden'] {
		display: none;
	}

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
	}
</style>
