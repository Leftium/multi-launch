<script lang="ts">
	import { page } from '$app/stores'

	import lzString from 'lz-string'
	const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = lzString

	let configToml = decompressFromEncodedURIComponent($page.url.searchParams.get('config') || '')

	// Bindings:
	let textArea: HTMLTextAreaElement
	let text =
		configToml ||
		`[Svelte.Discord]
noquery = "https://discord.com/channels/457912077277855764/1060332203571151019"
default = ""

[Svelte.Reddit]
noquery = "https://www.reddit.com/r/sveltejs/new/"
default = "https://www.reddit.com/r/sveltejs/search/?q=QUERY"

[Svelte.StackOverflow]
default = "https://stackoverflow.com/search?q=%5Bsveltekit%5D+%5Bsvelte%5D+QUERY"

[Svelte."Kit Docs"]
noquery = 'https://kit.svelte.dev/docs/introduction'
default = ''

[Svelte."Svelte Docs"]
noquery = 'https://svelte.dev/docs'
default = ''
`
</script>

<main class="container">
	<a role="button" href="/?config={compressToEncodedURIComponent(text)}">Preview</a>

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
	}
</style>
