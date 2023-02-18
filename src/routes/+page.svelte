<script lang="ts">
	import '@picocss/pico'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	let query = 'QUERY'

	const makeClickHandler = (urlTemplate: string) => {
		return (e: Event) => {
			const queryTrimmed = query.trim()
			const url = urlTemplate.replace('QUERY', queryTrimmed)

			log('handleClick', url, e)
			window.open(url, '_blank')
		}
	}

	const handleClickGoogleTranslate = makeClickHandler(
		'https://translate.google.com/?sl=en&tl=ko&text=QUERY&op=translate'
	)

	const handleClickPapago = makeClickHandler(
		'https://papago.naver.com/?sk=en&tk=ko&hn=0&st=QUERY'
	)
</script>

<main class="container">
	<textarea rows="2" bind:value={query} />

	<div>
		<button class="primary">All Translate</button>
		<button class="secondary" on:click={handleClickGoogleTranslate}
			>Google</button
		>
		<button class="secondary" on:click={handleClickPapago}>Papago</button>
	</div>

	<div>
		<button class="primary">All Shopping</button>
		<button class="secondary">Danawa</button>
		<button class="secondary">Naver</button>
		<button class="secondary">Kakao</button>
		<button class="secondary">Enuri</button>
	</div>

	<div>
		<button class="primary">All Search</button>
		<button class="secondary">Google</button>
		<button class="secondary">Naver</button>
		<button class="secondary">Daum</button>
		<button class="secondary">Bing</button>
		<button class="secondary">Yandex</button>
	</div>
</main>

<style>
	main > div {
		margin-bottom: var(--spacing);
	}

	button.primary {
		width: 8rem;
	}

	/* Undo pico css button styling */
	button {
		width: auto;
		display: inline;
	}

	button {
		margin-bottom: 0.1rem;
	}
</style>
