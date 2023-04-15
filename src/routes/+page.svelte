<script lang="ts">
	import '../app.scss'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import TOML from '@ltd/j-toml'

	import type { ActionData, PageData } from './$types'

	// Data props:
	export let data: PageData
	export let form: ActionData

	let successMessages: string[] = []
	let errorMessages: string[] = []

	let planToml = form?.planToml || data.planToml
	let planJson
	let planTitle = 'Untitled'

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
					<div>
						<button name="operation" value="save">Save</button><button
							class="secondary"
							name="operation"
							value="insert">Insert</button
						><button class="secondary" name="operation" value="copy">Copy</button
						><button class="secondary" name="operation" value="share">Share</button>
					</div>
					{#if successMessages.length}
						<blockquote>{@html successMessages[0]}</blockquote>
					{/if}
					{#if errorMessages.length}
						<blockquote class="error">{errorMessages[0]}</blockquote>
					{/if}
				</header>
				<div class="wrap-textarea fullscreen">
					<textarea name="planToml" rows="20" spellcheck="false">{planToml}</textarea>
				</div>
			</article>
		</details>
	</form>
</main>

<style>
	.error {
		color: red;
	}

	details {
		border-bottom: none;
	}

	details header {
		margin-bottom: var(--spacing);
	}

	details header {
		margin-right: calc(var(--spacing) * -1);
		margin-left: calc(var(--spacing) * -1);
		padding: var(--spacing);
	}

	details > article {
		margin-top: 0;
		padding-right: var(--spacing);
		padding-left: var(--spacing);
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
		width: calc(100% / 4);
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
