<script lang="ts">
	import '@picocss/pico'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	// Bindings:
	let query = $page.url.searchParams.get('q') || ''
	let textArea: HTMLTextAreaElement

	type UrlTemplateOrGenerator = string | ((query: string) => string)

	const makeClickHandler = (urlTemplateOrGenerator: UrlTemplateOrGenerator) => {
		return (e: Event) => {
			const urlTemplate =
				typeof urlTemplateOrGenerator === 'string'
					? urlTemplateOrGenerator
					: urlTemplateOrGenerator(query)

			const queryTrimmedEncoded = encodeURIComponent(query.trim())
			const url = urlTemplate.replace('QUERY', queryTrimmedEncoded)

			log('handleClick', url, e)

			if (url !== '') {
				window.open(url, '_blank')
			}
		}
	}

	const handleClickAmazonUk = makeClickHandler('https://www.amazon.co.uk/s?k=QUERY')

	const handleClickAliExpress = makeClickHandler('https://www.aliexpress.com/af/QUERY.html')

	const handClickBmStores = makeClickHandler('https://www.bmstores.co.uk/search?query=QUERY')

	const handleClickAllShopping = (e: Event) => {
		handleClickAmazonUk(e)
		handleClickAliExpress(e)
		handClickBmStores(e)
	}

	const handleFocus = (e: Event) => {
		textArea.select()
	}

	const handleKeydown = (e: KeyboardEvent) => {
		log('handleKeydown', e)

		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleClickAllShopping(e)
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
		textArea.focus()

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
	<h1>
		MultiLaunch <small><a href="/doc">Help & Tips</a></small>
	</h1>

	<textarea rows="2" bind:value={query} bind:this={textArea} on:focus={handleFocus} />

	<div>
		<button on:click={handleClickAllShopping}>All Shopping</button>
		<button class="secondary" on:click={handleClickAmazonUk}>Amazon UK</button>
		<button class="secondary" on:click={handleClickAliExpress}>AliExpress</button>
		<button class="secondary" on:click={handClickBmStores}>B&M</button>
	</div>
</main>

<style>
	h1 {
		margin-bottom: 0;
	}

	small {
		font-size: 42%;
		font-weight: normal;
	}

	main > div {
		margin-bottom: var(--spacing);
	}

	div button {
		width: 6.96rem;
		margin-bottom: 0.2rem;

		font-size: 0.9rem;

		padding-left: 0.3rem;
		padding-right: 0.3rem;

		/* Undo pico css button styling */
		display: inline;
	}
</style>
