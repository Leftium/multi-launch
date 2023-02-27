<script lang="ts">
	import { page } from '$app/stores'

	import lzString from 'lz-string'
	const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = lzString

	let planToml = decompressFromEncodedURIComponent($page.url.searchParams.get('plan') || '')

	// Bindings:
	let textArea: HTMLTextAreaElement
	let text =
		planToml ||
		`[Svelte.Discord]
ifquery = ""
default = "https://discord.com/channels/457912077277855764/"

[Svelte.Reddit]
ifquery = "https://www.reddit.com/r/sveltejs/search/?q=QUERY"
default = "https://www.reddit.com/r/sveltejs/new/"

[Svelte.StackOverflow]
default = "https://stackoverflow.com/search?q=%5Bsveltekit%5D+%5Bsvelte%5D+QUERY"

[Svelte."Kit Docs"]
exclude = true
ifquery = ''
default = 'https://kit.svelte.dev/docs/introduction'

[Svelte."Svelte Docs"]
exclude = true
ifquery = ''
default = 'https://svelte.dev/docs'
`
</script>

<main class="container">
	<a role="button" href="/?plan={compressToEncodedURIComponent(text)}">Preview</a>

	<textarea rows="40" bind:value={text} bind:this={textArea} spellcheck="false" />
</main>

<style>
	main a {
		margin-bottom: var(--spacing);
	}

	textarea {
		max-height: 60vh;
		white-space: pre;
		overflow-wrap: normal;
		overflow-x: scroll;
		font-family: 'Menlo', 'Consolas', 'Roboto Mono', 'Ubuntu Monospace', 'Noto Mono',
			'Oxygen Mono', 'Liberation Mono', monospace, 'Apple Color Emoji', 'Segoe UI Emoji',
			'Segoe UI Symbol', 'Noto Color Emoji';
	}
</style>
