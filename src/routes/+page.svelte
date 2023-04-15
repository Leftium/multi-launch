<script lang="ts">
	import '../app.scss'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import TOML from '@ltd/j-toml'
	import lzString from 'lz-string'

	import type { ActionData, PageData } from './$types'

	// Data props:
	export let data: PageData
	export let form: ActionData

	let successMessages: string[] = []
	let errorMessages: string[] = []

	let planToml = form?.planToml || data.planToml
	let planJson
	let planTitle = 'Untitled'

	let failedToCopy = false

	if (form?.errorMessage) {
		errorMessages.push(form.errorMessage)
	}

	if (form?.successMessage) {
		successMessages.push(form.successMessage)
	}

	try {
		planJson = TOML.parse(planToml)
		planTitle = planJson.title as string
	} catch (error) {
		errorMessages.push((error as Error).message)
	}

	let open =
		successMessages.length || errorMessages.length || form?.fromEditOperation ? true : false

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
				</header>
				<div class="wrap-textarea fullscreen">
					<textarea name="planToml" rows="20" spellcheck="false" bind:value={planToml} />
				</div>
			</article>
		</details>
	</form>
</main>

<style>
	.error {
		color: red;
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
