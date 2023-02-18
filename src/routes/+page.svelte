<script lang="ts">
	import '@picocss/pico'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	let query = 'QUERY'

	type UrlTemplateOrGenerator = string | ((query: string) => string)

	const makeClickHandler = (
		urlTemplateOrGenerator: UrlTemplateOrGenerator
	) => {
		return (e: Event) => {
			const urlTemplate =
				typeof urlTemplateOrGenerator === 'string'
					? urlTemplateOrGenerator
					: urlTemplateOrGenerator(query)

			const queryTrimmedEncoded = encodeURIComponent(query.trim())
			const url = urlTemplate.replace('QUERY', queryTrimmedEncoded)

			log('handleClick', url, e)
			window.open(url, '_blank')
		}
	}

	// Makes function that returns different strings depending on if input contains Korean.
	const ifKorean = (ifKorean: string, ifNotKorean: string) => {
		const koreanRegex = /[\u3131-\uD79D]/giu // https://stackoverflow.com/a/38156301/117030
		return (text: string) => {
			return koreanRegex.test(text) ? ifKorean : ifNotKorean
		}
	}

	const handleClickGoogleTranslate = makeClickHandler(
		ifKorean(
			'https://translate.google.com/?sl=ko&tl=en&text=QUERY&op=translate',
			'https://translate.google.com/?sl=en&tl=ko&text=QUERY&op=translate'
		)
	)

	const handleClickPapago = makeClickHandler(
		ifKorean(
			'https://papago.naver.com/?sk=ko&tk=en&hn=0&st=QUERY',
			'https://papago.naver.com/?sk=en&tk=ko&hn=0&st=QUERY'
		)
	)

	const handleClickAllTranslate = (e: Event) => {
		handleClickGoogleTranslate(e)
		handleClickPapago(e)
	}

	const handleClickDanawa = makeClickHandler(
		'https://search.danawa.com/dsearch.php?k1=QUERY&module=goods&act=dispMain'
	)

	const handleClickNaverShopping = makeClickHandler(
		'https://search.shopping.naver.com/search/all?query=QUERY&cat_id=&frm=NVSHATC'
	)

	const handleClickKakaoShopping = makeClickHandler(
		'https://shoppinghow.kakao.com/search/QUERY'
	)

	const handleClickEnuri = makeClickHandler(
		'http://www.enuri.com/search.jsp?keyword=QUERY'
	)

	const handleClickAllShopping = (e: Event) => {
		handleClickEnuri(e)
		handleClickKakaoShopping(e)
		handleClickNaverShopping(e)
		handleClickDanawa(e)
	}
</script>

<main class="container">
	<textarea rows="2" bind:value={query} />

	<div>
		<button class="primary" on:click={handleClickAllTranslate}
			>All Translate</button
		>
		<button class="secondary" on:click={handleClickGoogleTranslate}
			>Google</button
		>
		<button class="secondary" on:click={handleClickPapago}>Papago</button>
	</div>

	<div>
		<button class="primary" on:click={handleClickAllShopping}
			>All Shopping</button
		>
		<button class="secondary" on:click={handleClickDanawa}>Danawa</button>
		<button class="secondary" on:click={handleClickNaverShopping}
			>Naver</button
		>
		<button class="secondary" on:click={handleClickKakaoShopping}
			>Kakao</button
		>
		<button class="secondary" on:click={handleClickEnuri}>Enuri</button>
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
