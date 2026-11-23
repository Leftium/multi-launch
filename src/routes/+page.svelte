<script lang="ts">
	import { preventDefault } from 'svelte/legacy'
	import { untrack } from 'svelte'

	import BrandHeader from '#lib/BrandHeader.svelte'

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
				popperOptions: { strategy: 'fixed' },
			})
			return instance.destroy
		}
	}

	import {
		makeUrlTemplateSelector,
		makeSearchGroup,
		type SearchEnginePlan,
		type SearchEngine,
		type SearchGroup,
		type SearchGroupPlans,
		type LaunchButtonClickHandler,
	} from '#lib/search-engines.js'
	import { onMount, tick } from 'svelte'
	import { page } from '$app/state'
	import { replaceState } from '$app/navigation'
	import samplePlanToml from '#lib/plans/sample.toml?raw'
	import { isWebUrl, validateSyncedToml } from '#lib/sync/plan-toml.js'
	import type { PlanHandle } from '#lib/sync/repo.js'
	import {
		DEFAULT_SYNC_SERVER,
		LOCAL_PLAN,
		emptyRegistry,
		forgetSyncedPlan,
		liveLink,
		normalizeServerUrl,
		parseJoinLink,
		readDraft,
		readRegistry,
		registerSyncedPlan,
		selectPlan,
		writeDraft,
		writeRegistry,
		type JoinTarget,
		type PlanDraft,
		type PlanRegistry,
		type SyncedPlanReference,
	} from '#lib/sync/registry.js'

	interface Props {
		// Data props:
		data: PageData
		form: ActionData
	}

	let { data, form }: Props = $props()

	// Bindings
	let query = $state(untrack(() => form?.query || page.url.searchParams.get('q') || ''))
	let textArea: HTMLTextAreaElement | undefined = $state()

	let wrapTextarea: HTMLElement | undefined = $state()

	let successMessages: string[] = $state([])
	let errorMessages: string[] = $state([])

	let planToml = $state(
		untrack(() => form?.planToml ?? (form?.savedLocal ? data.localPlanToml : data.planToml))
	)
	let planJson: Record<string, unknown> = $state({})
	let planTitle = $state('Untitled')

	let searchGroups: SearchGroup[] = $state([])

	untrack(() => {
		if (form?.errorMessage) {
			errorMessages.push(form.errorMessage)
		}

		if (form?.successMessage) {
			successMessages.push(form.successMessage)
		}
	})

	let open = $state(
		untrack(() => !!(successMessages.length || errorMessages.length || form?.fromEditOperation))
	)

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
		plan: SearchEnginePlan
	): SearchEngine => {
		const getUrlTemplate = makeUrlTemplateSelector(plan)
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
					if (url !== '' && (!entry || isWebUrl(url))) {
						window.open(url, targetTabName)
					}
				}
			},
		}
	}

	const makeSearchGroups = (planJson: Record<string, unknown>) => {
		const { title: _title, ...searchGroupPlans } = planJson as Record<string, SearchGroupPlans>

		const searchGroups = _.map(searchGroupPlans, (plans: SearchGroupPlans, name: string) =>
			makeSearchGroup(name, plans, makeSearchEngine)
		)

		return searchGroups
	}

	function refreshLauncher() {
		successMessages = []
		errorMessages = []
		try {
			if (draftKey !== LOCAL_PLAN && !preview) validateSyncedToml(planToml)
			planJson = TOML.parse(planToml)
			planTitle = typeof planJson.title === 'string' ? planJson.title : 'Untitled'
			searchGroups = makeSearchGroups(planJson)
		} catch (error) {
			errorMessages = [(error as Error).message]
			searchGroups = []
		}
	}

	function initializeLauncher() {
		const messages = [...successMessages]
		const errors = [...errorMessages]
		refreshLauncher()
		successMessages = messages
		errorMessages = [...errors, ...errorMessages]
	}

	const unhideIfJavascript = (node: HTMLElement) => {
		node.hidden = false
	}

	const handleClickShare = async (event: Event) => {
		if (!entry && !navigator.clipboard) return
		event.preventDefault()
		try {
			if (entry) validateSyncedToml(planToml)
			else TOML.parse(planToml)
			const shareLink = `${location.origin}/?p=${lzString.compressToEncodedURIComponent(planToml)}`
			try {
				await navigator.clipboard.writeText(shareLink)
				successMessages = [
					`<a href="${shareLink}" data-sveltekit-reload>Snapshot link</a> copied to clipboard.`,
				]
			} catch {
				successMessages = [
					`<a href="${shareLink}" data-sveltekit-reload>Open or copy the snapshot link</a>.`,
				]
			}
		} catch (error) {
			errorMessages = [(error as Error).message]
		}
	}

	const handleClickCopy = async (event: Event) => {
		if (!entry && !navigator.clipboard) return
		event.preventDefault()
		try {
			await navigator.clipboard.writeText(planToml)
			successMessages = ['Plan TOML copied to clipboard.']
		} catch {
			errorMessages = ['Select and copy the TOML from the editor.']
		}
	}

	const handleFocus = (_e: Event) => {
		textArea!.select()
	}

	const handleBlur = (_e: Event) => {
		wrapTextarea!.classList.remove('fullscreen')
	}

	function handleTextareaInput() {
		refreshLauncher()
		try {
			persistDraft()
		} catch (error) {
			reportSyncError(error)
		}
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (dialogOpen) return
		if (
			textArea &&
			e.shiftKey &&
			['Delete', 'Backspace'].includes(e.key) &&
			!isTextInputElement(document.activeElement)
		) {
			e.preventDefault()
			query = ''
			textArea!.parentElement?.classList.remove('fullscreen')
			textArea!.focus()
		}

		if (
			textArea &&
			e.key !== 'Tab' &&
			!(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) &&
			!isTextInputElement(document.activeElement) &&
			!document.activeElement?.matches('[aria-haspopup=dialog]')
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
				searchGroups[0]?.handleClickAll(e, true)
				e.preventDefault()
			}
		}

		if (e.key === 'Escape') {
			e.stopPropagation()
			wrapTextarea?.classList.remove('fullscreen')
			textArea!.blur()
		}
	}

	const handlePaste = (e: ClipboardEvent) => {
		if (dialogOpen) return
		const text = e.clipboardData?.getData('text')
		if (text && !isTextInputElement(document.activeElement)) {
			e.preventDefault()
			query = text
		}
	}

	const handleToggleFullscreen = (_e: MouseEvent) => {
		log('handleToggleFullscreen')
		wrapTextarea!.classList.toggle('fullscreen')
	}

	const makeClickAllHandler = (clickAllHandler: LaunchButtonClickHandler, index: number) => {
		return (e: Event) => {
			const me = e as MouseEvent
			if (me.altKey) {
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
			if (!wrapTextarea) return
			wrapTextarea.style.bottom = `${height - (viewport?.height || 0)}px`
		}

		window.visualViewport?.addEventListener('resize', resizeHandler)

		window.addEventListener('keydown', handleKeydown)
		window.addEventListener('beforeunload', preventLostDraft)
		void restorePlans()
		const statusTimer = window.setInterval(() => {
			if (entry) connected = syncClient?.isConnected(entry.serverUrl) ?? false
		}, 1000)

		return () => {
			window.removeEventListener('keydown', handleKeydown)
			window.removeEventListener('beforeunload', preventLostDraft)
			viewport?.removeEventListener('resize', resizeHandler)
			window.clearInterval(statusTimer)
			stopWatching?.()
		}
	})
	let registry = $state.raw(emptyRegistry())
	let registryReady = $state(false)
	let preview = $state(untrack(() => page.url.pathname !== '/' || page.url.searchParams.has('p')))
	let draftKey = untrack(() =>
		preview
			? `preview:${page.url.pathname}:${page.url.searchParams.get('p') ?? ''}`
			: LOCAL_PLAN
	)
	let savedToml = $state(untrack(() => (preview ? data.planToml : data.localPlanToml)))
	let draftBase = $state(untrack(() => savedToml))
	let activeHandle: PlanHandle | undefined
	let stopWatching: (() => void) | undefined
	let storageFailed = false
	let syncClient: typeof import('#lib/sync/repo.js') | undefined
	let busy = $state('')
	let restoring = $state(false)
	let syncError = $state('')
	let connected = $state(false)
	let planDialog: HTMLDialogElement | undefined = $state()
	let planOpener: HTMLButtonElement | undefined = $state()
	let dialogOpen = $state(false)
	let menu = $state<'open' | 'create'>('open')
	let selectedKey = $state(LOCAL_PLAN)
	let selectedPlan = $derived(registry.synced.find((plan) => plan.key === selectedKey))
	let source = $state('sample')
	let serverInput = $state(DEFAULT_SYNC_SERVER)
	let joinFailed = $state(false)
	let copiedLink = $state('')
	let syncNotice = $state('')
	let entry = $derived(
		preview ? undefined : registry.synced.find((plan) => plan.key === registry.active)
	)
	let blocked = $derived(restoring || (!!entry && draftKey !== entry.key))
	let remoteChanged = $derived(!!entry && planToml !== savedToml && draftBase !== savedToml)
	untrack(initializeLauncher)

	function openPlanDialog() {
		selectedKey = preview ? LOCAL_PLAN : registry.active
		planDialog?.showModal()
		dialogOpen = !!planDialog?.open
	}

	async function closePlanDialog() {
		dialogOpen = false
		menu = 'open'
		await tick()
		planOpener?.focus()
	}

	async function showPlanView(view: typeof menu) {
		menu = view
		syncError = ''
		syncNotice = ''
		copiedLink = ''
		if (view === 'create') {
			source = 'sample'
			serverInput = DEFAULT_SYNC_SERVER
		}
		await tick()
		planDialog?.querySelector<HTMLElement>('h2')?.focus()
	}

	function syncedTitle(plan: SyncedPlanReference) {
		const suffix = plan.documentId.slice(-8)
		if (!plan.title) return `Untitled (${suffix})`
		const matches = registry.synced.filter((item) => item.title === plan.title)
		return matches.length > 1 ? `${plan.title} (${suffix})` : plan.title
	}

	function withPlanTitle(current: PlanRegistry, key: string, title?: string): PlanRegistry {
		const nextTitle = title?.trim() || undefined
		const plan = current.synced.find((item) => item.key === key)
		if (!plan || (plan.title === nextTitle && plan.label === undefined)) return current
		return {
			...current,
			synced: current.synced.map((item) =>
				item.key === key ? { ...item, title: nextTitle, label: undefined } : item
			),
		}
	}

	function cachePlanTitle(key: string, title?: string) {
		const next = withPlanTitle(registry, key, title)
		if (next === registry) return
		registry = next
		try {
			writeRegistry(localStorage, next)
		} catch (error) {
			reportSyncError(error)
		}
	}

	function forgetPlan(plan: SyncedPlanReference) {
		if (
			!window.confirm(
				'Remove this plan from the list? Keep the live link to rejoin. Your cached copy stays on this device.'
			)
		)
			return
		void syncOperation('Removing plan...', async () => {
			const next = forgetSyncedPlan(registry, plan.key)
			if (entry?.key === plan.key) await switchPlan(LOCAL_PLAN, next)
			else persistRegistry(next)
			selectedKey = preview ? LOCAL_PLAN : registry.active
		})
	}

	function reportSyncError(error: unknown) {
		syncError = error instanceof Error ? error.message : String(error)
	}

	async function client() {
		syncClient ??= await import('#lib/sync/repo.js')
		return syncClient
	}

	function persistDraft() {
		try {
			writeDraft(localStorage, draftKey, { base: draftBase, text: planToml }, savedToml)
			storageFailed = false
		} catch (error) {
			storageFailed = planToml !== savedToml
			throw error
		}
	}

	function replaceEditor(key: string, saved: string, draft?: PlanDraft) {
		draftKey = key
		savedToml = saved
		draftBase = draft?.base ?? saved
		planToml = draft?.text ?? saved
		refreshLauncher()
	}

	function persistRegistry(next: PlanRegistry) {
		writeRegistry(localStorage, next)
		registry = next
		syncClient?.updateSharing(next.synced)
	}

	function clearPreviewUrl() {
		const url = new URL(page.url)
		url.pathname = '/'
		url.searchParams.delete('p')
		url.searchParams.delete('doc')
		url.searchParams.delete('server')
		replaceState(url, page.state)
		preview = false
	}

	function displaySynced(
		plan: SyncedPlanReference,
		handle: PlanHandle,
		saved: string,
		draft?: PlanDraft
	) {
		stopWatching?.()
		activeHandle = handle
		replaceEditor(plan.key, saved, draft)
		connected = syncClient!.isConnected(plan.serverUrl)
		const receive = () => {
			try {
				const incoming = syncClient!.readPlan(handle)
				const title = validateSyncedToml(incoming)
				const dirty = planToml !== savedToml
				if (busy === 'Saving plan...') return
				savedToml = incoming
				if (!dirty) replaceEditor(plan.key, incoming)
				else if (planToml === incoming) {
					draftBase = incoming
					persistDraft()
				}
				cachePlanTitle(plan.key, title)
			} catch (error) {
				reportSyncError(error)
			}
		}
		handle.on('change', receive)
		stopWatching = () => {
			handle.off('change', receive)
		}
	}

	async function syncOperation(message: string, operation: () => Promise<void>) {
		if (busy) return
		busy = message
		syncError = ''
		syncNotice = ''
		copiedLink = ''
		try {
			await operation()
		} catch (error) {
			reportSyncError(error)
		} finally {
			busy = ''
		}
	}

	function readSynced(handle: PlanHandle) {
		const saved = syncClient!.readPlan(handle)
		const title = validateSyncedToml(saved)
		return { saved, title }
	}

	async function switchPlan(key: string, next = selectPlan(registry, key), clearUrl = true) {
		const draft = readDraft(localStorage, key)
		if (key === LOCAL_PLAN) {
			persistDraft()
			persistRegistry(next)
			clearPreviewUrl()
			stopWatching?.()
			activeHandle = undefined
			replaceEditor(key, data.localPlanToml, draft)
			return
		}
		const plan = next.synced.find((item) => item.key === key)!
		const handle = await (await client()).openPlan(plan)
		const { saved, title } = readSynced(handle)
		persistDraft()
		persistRegistry(withPlanTitle(next, key, title))
		if (clearUrl) clearPreviewUrl()
		displaySynced(plan, handle, saved, draft)
	}

	function rememberPlan(target: JoinTarget, handle: PlanHandle, saved: string, title?: string) {
		const { registry: next, key } = registerSyncedPlan(registry, {
			...target,
			key: JSON.stringify([target.serverUrl, target.documentId]),
			title: title?.trim() || undefined,
		})
		const draft = readDraft(localStorage, key)
		persistDraft()
		persistRegistry(withPlanTitle(selectPlan(next, key), key, title))
		clearPreviewUrl()
		displaySynced(
			next.synced.find((plan) => plan.key === key)!,
			handle,
			saved,
			draft
		)
		menu = 'open'
		planDialog?.close()
	}

	function join(url: URL) {
		return syncOperation('Opening live plan...', async () => {
			joinFailed = true
			const target = parseJoinLink(url)
			if (!target) throw new Error('Paste a MultiLaunch live link with a document ID.')
			const api = await client()
			target.documentId = api.documentUrl(target.documentId)
			const known =
				target.serverUrl === normalizeServerUrl(DEFAULT_SYNC_SERVER) ||
				registry.synced.some((plan) => plan.serverUrl === target.serverUrl)
			if (
				!known &&
				!window.confirm(`Connect to ${target.serverUrl} to open this live plan?`)
			) {
				throw new Error('Connection canceled.')
			}
			const handle = await api.openPlan(target)
			const { saved, title } = readSynced(handle)
			rememberPlan(target, handle, saved, title)
			joinFailed = false
		})
	}

	function createSynced() {
		return syncOperation('Creating synced plan...', async () => {
			const serverUrl = normalizeServerUrl(serverInput)
			const copiedPlan = registry.synced.find((plan) => plan.key === source)
			const text =
				source === 'sample'
					? samplePlanToml
					: copiedPlan
						? readSynced(await (await client()).openPlan(copiedPlan)).saved
						: data.localPlanToml
			const title = validateSyncedToml(text)
			persistDraft()
			const handle = await (await client()).createPlan(serverUrl, text)
			rememberPlan({ documentId: handle.url, serverUrl }, handle, text, title)
		})
	}

	function editFormSubmit(event: SubmitEvent) {
		if (!entry) return
		event.preventDefault()
		if (!activeHandle || busy || blocked) return
		const plan = entry
		const handle = activeHandle
		const operation = (event.submitter as HTMLButtonElement | null)?.value
		if (operation === 'save') {
			void syncOperation('Saving plan...', async () => {
				const text = planToml
				validateSyncedToml(text)
				if (
					remoteChanged &&
					!window.confirm(
						'The saved plan changed while you were editing. Save this draft over the incoming version?'
					)
				)
					return
				await syncClient!.savePlan(plan.serverUrl, handle, text)
				const { saved, title } = readSynced(handle)
				savedToml = saved
				draftBase = saved
				cachePlanTitle(plan.key, title)
				persistDraft()
				successMessages = [
					text === saved
						? 'Saved to the synced plan on this device.'
						: 'The synced plan changed again. Your draft is still in the editor.',
				]
			})
		} else if (operation === 'add' && planToml !== savedToml) {
			planToml = `${savedToml}\n\n${planToml.replace(/^title\s*=.*/m, '# $&')}`
			handleTextareaInput()
		} else if (operation === 'add') {
			errorMessages = ['Paste the TOML to append into the editor, then choose Add (Preview).']
		}
	}

	async function copyLive(plan: SyncedPlanReference) {
		copiedLink = liveLink(page.url.origin, plan)
		syncNotice = ''
		try {
			await navigator.clipboard.writeText(copiedLink)
			copiedLink = ''
			syncNotice = 'Live link copied to clipboard.'
			syncError = ''
		} catch {
			syncError = 'Select and copy the live link below.'
		}
	}

	async function restorePlans() {
		try {
			registry = readRegistry(localStorage)
			registryReady = true
			if (form?.planToml !== undefined) {
				persistDraft()
			} else if (form?.savedLocal && !preview) {
				replaceEditor(LOCAL_PLAN, data.localPlanToml)
				persistDraft()
			} else {
				const draft = readDraft(localStorage, draftKey)
				if (draft && draft.text !== savedToml) replaceEditor(draftKey, savedToml, draft)
			}
		} catch (error) {
			reportSyncError(error)
			if (!registryReady) return
		}
		if (preview) return
		if (registry.active !== LOCAL_PLAN) {
			restoring = true
			await syncOperation('Loading saved plan...', () =>
				switchPlan(registry.active, registry, false)
			)
			restoring = false
		}
		if (page.url.searchParams.has('doc')) {
			await join(page.url)
		}
	}

	function preventLostDraft(event: BeforeUnloadEvent) {
		if (storageFailed) {
			event.preventDefault()
			event.returnValue = true
		}
	}
</script>

<svelte:body onpaste={handlePaste} />

{#snippet planFeedback()}
	{#if busy}<p role="status">{busy}</p>{/if}
	{#if syncError}<p class="error" role="alert">{syncError}</p>{/if}
	{#if syncNotice}<p role="status">{syncNotice}</p>{/if}
	{#if copiedLink}<label>Live link<input readonly value={copiedLink} /></label>{/if}
{/snippet}

<BrandHeader>
	{#snippet actions()}
		{#if registryReady}
			<button
				class="secondary"
				type="button"
				aria-haspopup="dialog"
				bind:this={planOpener}
				disabled={!!busy}
				onclick={openPlanDialog}
			>
				Open Plan
			</button>
		{/if}
	{/snippet}
</BrandHeader>

<main>
	{#if registryReady}
		<dialog
			class="plan-dialog"
			aria-labelledby="plan-dialog-title"
			bind:this={planDialog}
			onclose={closePlanDialog}
			oncancel={(event) => {
				if (busy) event.preventDefault()
			}}
		>
			<header class="plan-dialog-header">
				<h2 id="plan-dialog-title" tabindex="-1">
					{menu === 'create' ? 'New synced plan' : 'Open Plan'}
				</h2>
				<button
					class="dialog-close"
					type="button"
					aria-label="Close dialog"
					disabled={!!busy}
					onclick={() => planDialog?.close()}
					><span aria-hidden="true">&times;</span></button
				>
			</header>
			{#if menu === 'create'}
				<form
					onsubmit={(event) => {
						event.preventDefault()
						void createSynced()
					}}
				>
					<fieldset disabled={!!busy}>
						<legend>Start with</legend>
						<label
							><input
								type="radio"
								name="source"
								value="sample"
								bind:group={source}
							/>Sample plan</label
						>
						<label
							><input
								type="radio"
								name="source"
								value={LOCAL_PLAN}
								bind:group={source}
							/>Saved Local plan</label
						>
						{#each registry.synced as plan (plan.key)}
							<label
								><input
									type="radio"
									name="source"
									value={plan.key}
									bind:group={source}
								/>Saved {syncedTitle(plan)}</label
							>
						{/each}
					</fieldset>
					<details>
						<summary>Sync server</summary>
						<label
							>WebSocket URL<input
								bind:value={serverInput}
								disabled={!!busy}
							/></label
						>
					</details>
					<p>
						Creating a copy shares the selected TOML with <strong>{serverInput}</strong
						>. Synced plans are non-private. The experimental community relay may lose
						stored plans.
					</p>
					<div class="plan-buttons">
						<button disabled={!!busy}>Create synced copy</button>
						<button
							class="secondary"
							type="button"
							disabled={!!busy}
							onclick={() => showPlanView('open')}>Back</button
						>
					</div>
				</form>
			{:else}
				<form
					onsubmit={(event) => {
						event.preventDefault()
						void syncOperation('Opening plan...', async () => {
							await switchPlan(selectedKey)
							planDialog?.close()
						})
					}}
				>
					<fieldset disabled={!!busy} aria-label="Saved plans">
						<label
							><input
								type="radio"
								name="plan"
								value={LOCAL_PLAN}
								bind:group={selectedKey}
							/>Local</label
						>
						{#each registry.synced as plan (plan.key)}
							<label
								><input
									type="radio"
									name="plan"
									value={plan.key}
									bind:group={selectedKey}
								/>
								<span>{syncedTitle(plan)} <small>Synced</small></span>
							</label>
						{/each}
					</fieldset>
					{#if selectedPlan && selectedPlan.key === entry?.key && !blocked}
						<p>
							<small
								>{connected ? 'Connected' : 'Offline or connecting'} · {selectedPlan.serverUrl}</small
							>
						</p>
					{/if}
					<div class="plan-buttons">
						<button disabled={!!busy}>Open</button>
						<button
							class="secondary"
							type="button"
							disabled={!!busy}
							onclick={() => showPlanView('create')}>New synced plan</button
						>
					</div>
					{#if selectedPlan}
						{@const plan = selectedPlan}
						<div class="plan-buttons">
							<button
								class="secondary"
								type="button"
								disabled={!!busy}
								onclick={() => copyLive(plan)}>Copy live link</button
							>
							<button
								class="secondary"
								type="button"
								disabled={!!busy}
								onclick={() => forgetPlan(plan)}>Remove from list</button
							>
						</div>
					{/if}
				</form>
			{/if}
			{@render planFeedback()}
		</dialog>
	{/if}
	{#if !dialogOpen}
		{@render planFeedback()}
		{#if joinFailed && !busy && page.url.searchParams.has('doc')}
			<button class="secondary" type="button" onclick={() => join(page.url)}
				>Retry opening live plan</button
			>
		{/if}
	{/if}
	{#if remoteChanged}
		<p role="status">The saved plan changed. Your draft is still in the editor.</p>
		<button
			class="secondary"
			type="button"
			disabled={!!busy}
			onclick={() => {
				if (window.confirm('Discard this draft and load the saved plan?')) {
					replaceEditor(draftKey, savedToml)
					try {
						persistDraft()
					} catch (error) {
						reportSyncError(error)
					}
				}
			}}>Load saved version</button
		>
	{/if}
	{#if blocked && !busy}
		<p>The selected synced plan could not be loaded.</p>
		<button class="secondary" type="button" onclick={() => window.location.reload()}
			>Retry loading</button
		>
	{/if}
	{#if !blocked}
		<form method="POST" action="?/edit" onsubmit={editFormSubmit}>
			<details class="editor" bind:open>
				<summary class="nc-button secondary">
					<div>
						<span>{planTitle}</span>
						<span>Edit</span>
					</div>
				</summary>

				<article>
					<header>
						<div class="nc-join" role="group">
							<button disabled={!!busy} name="operation" value="save"
								><span class="button-text">Save</span></button
							><button
								disabled={!!busy}
								class="secondary"
								name="operation"
								value="add"><span class="button-text">Add (Preview)</span></button
							><button
								class="secondary"
								name="operation"
								value="copy"
								onclick={handleClickCopy}
								><span class="button-text">Copy</span></button
							><button
								class="secondary"
								name="operation"
								value="share"
								onclick={handleClickShare}
								><span class="button-text">Share</span></button
							>
						</div>
						{#if successMessages.length}
							{#each successMessages.slice(-1) as successMessage (successMessage)}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
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
							value={planToml}
							disabled={!!busy}
							oninput={(event) => {
								planToml = event.currentTarget.value
								handleTextareaInput()
							}}
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

					<!-- eslint-disable-next-line svelte/no-static-element-interactions, svelte/click-events-have-key-events -->
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
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
					<!-- eslint-disable-next-line svelte/no-static-element-interactions, svelte/click-events-have-key-events -->
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
					<iconify-icon
						icon="material-symbols:fullscreen-exit"
						class="icon"
						width="24"
						onclick={handleToggleFullscreen}
					></iconify-icon>
				</div>
			</div>

			{#each searchGroups as searchGroup, index (searchGroup.name)}<div class="search-group">
					<button
						onclick={preventDefault(
							makeClickAllHandler(searchGroup.handleClickAll, index)
						)}
						><span class="button-text"
							><span class="icon">⚡</span>{searchGroup.name}</span
						></button
					>{#each searchGroup.engines as engine (engine.name)}<button
							class="secondary"
							name="lz-engines"
							value={engine.lzEngines}
							class:exclude-from-all={engine.exclude ||
								!engine.getUrlTemplate(query, true)}
							{@attach tooltip(`${engine.name}\n${engine.getUrlTemplate(query)}`)}
							onclick={preventDefault(engine.clickHandler)}
							><span class="button-text">{engine.name}</span></button
						>{/each}
				</div>{/each}
		</form>

		<pre hidden>{JSON.stringify(planJson, null, 4)}</pre>

		<pre hidden>{JSON.stringify(makeSearchGroups(planJson), null, 4)}</pre>
	{/if}
</main>

<style>
	.plan-dialog {
		width: min(90vw, 34rem);
		overflow-wrap: anywhere;
	}

	.plan-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-bottom: var(--nc-spacing);
	}

	.plan-dialog-header h2 {
		margin: 0;
	}

	.dialog-close {
		all: unset;
		box-sizing: border-box;
		cursor: pointer;
		flex-shrink: 0;
		display: grid;
		place-items: center;
		inline-size: 2rem;
		block-size: 2rem;
		padding: 0;
		font-size: 1.25rem;
		line-height: 1;
	}

	.dialog-close:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: -2px;
	}

	.dialog-close:disabled {
		cursor: default;
		opacity: 0.5;
	}

	.plan-dialog fieldset {
		margin-bottom: var(--nc-spacing);
	}

	.plan-buttons {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.plan-buttons + .plan-buttons {
		margin-top: 0.5rem;
	}

	.wrap {
		position: relative;
	}

	.wrap textarea {
		margin-bottom: 0;
	}

	:global(.wrap-textarea) {
		margin-bottom: calc(var(--nc-spacing) / 2);
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
	.search-group button.secondary:hover + button.secondary,
	.search-group button.secondary + button.secondary:hover,
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
