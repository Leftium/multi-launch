<script lang="ts">
	import { page } from '$app/stores'

	import { compressToEncodedURIComponent } from 'lz-string'

	let configToml = decodeURIComponent($page.url.searchParams.get('config') || '')

	// Bindings:
	let textArea: HTMLTextAreaElement
	let text =
		configToml ||
		`[Translate.Google]
link = ""
lang_ko = "https://translate.google.com/?sl=ko&tl=en&text=QUERY&op=translate"
default = "https://translate.google.com/?sl=en&tl=ko&text=QUERY&op=translate"

[Translate.Papago]
link = "https://papago.naver.net/website?locale=en&source=auto&target=en&url=QUERY"
lang_ko = "https://papago.naver.com/?sk=ko&tk=en&hn=0&st=QUERY"
default = "https://papago.naver.com/?sk=en&tk=ko&hn=0&st=QUERY"
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
</style>
