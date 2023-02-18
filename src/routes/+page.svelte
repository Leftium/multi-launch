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

	const handleClickDanawa = makeClickHandler('https://search.danawa.com/dsearch.php?k1=QUERY')

	const handleClickNaverShopping = makeClickHandler(
		'https://search.shopping.naver.com/search/all?query=QUERY'
	)

	const handleClickKakaoShopping = makeClickHandler('https://shoppinghow.kakao.com/search/QUERY')

	const handleClickEnuri = makeClickHandler('http://www.enuri.com/search.jsp?keyword=QUERY')

	const handleClickJoonggoNara = makeClickHandler('https://web.joongna.com/search/QUERY')

	const handleClickJoonggoNaraCafe = makeClickHandler(
		'http://cafe.naver.com/joonggonara?iframe_url=/joonggonara.cafe//ArticleSearchList.nhn%3Fsearch.clubid=10050146%26search.searchBy=0%26search.query=QUERY'
	)

	const handleClickAllShopping = (e: Event) => {
		handleClickJoonggoNaraCafe(e)
		handleClickJoonggoNara(e)
		handleClickEnuri(e)
		handleClickKakaoShopping(e)
		handleClickNaverShopping(e)
		handleClickDanawa(e)
	}

	const handleClickGoogle = makeClickHandler('https://www.google.com/search?q=QUERY')
	const handleClickNaver = makeClickHandler('https://search.naver.com/search.naver?query=QUERY')
	const handleClickDaum = makeClickHandler('https://search.daum.net/search?q=QUERY')
	const handleClickBing = makeClickHandler('https://www.bing.com/search?q=QUERY')
	const handleClickYandex = makeClickHandler('https://yandex.com/search/?text=QUERY')

	const handleClickAllSearch = (e: Event) => {
		handleClickYandex(e)
		handleClickBing(e)
		handleClickDaum(e)
		handleClickNaver(e)
		handleClickGoogle(e)
	}

	// Makes function that returns different strings depending on if input contains a URL.
	const ifUrl = (ifUrl: string, ifNotUrl: string = '') => {
		const urlRegex = /^http/iu
		return (text: string) => {
			return urlRegex.test(text) ? ifUrl : ifNotUrl
		}
	}

	const handleClickGoogleImage = makeClickHandler(
		ifUrl(
			'https://lens.google.com/uploadbyurl?url=QUERY',
			'https://www.google.com/search?tbm=isch&q=QUERY'
		)
	)

	const handleClickYandexImage = makeClickHandler(
		ifUrl(
			'https://yandex.com/images/search?rpt=imageview&url=QUERY',
			'https://yandex.com/images/search?text=QUERY'
		)
	)

	const handleClickBingImage = makeClickHandler(
		ifUrl(
			'https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:QUERY',
			'https://www.bing.com/images/search?q=QUERY'
		)
	)

	const handleClickNaverImage = makeClickHandler(
		ifUrl('', 'https://search.naver.com/search.naver?where=image&query=QUERY')
	)

	const handleClickDaumImage = makeClickHandler(
		ifUrl('', 'https://search.daum.net/search?w=img&q=QUERY')
	)

	const handleClickUnsplash = makeClickHandler(ifUrl('', 'https://unsplash.com/s/photos/QUERY'))

	const handleClickPixabay = makeClickHandler(
		ifUrl('', 'https://pixabay.com/images/search/QUERY')
	)

	const handleClickPexels = makeClickHandler(ifUrl('', 'https://www.pexels.com/search/QUERY/'))

	const handleClickStockUnlimited = makeClickHandler(
		ifUrl('', 'https://www.stockunlimited.com/vector-image/?word=QUERY')
	)

	const handleClickYayImages = makeClickHandler(
		ifUrl('', 'https://yayimages.com/search?type=-1&phrase=QUERY')
	)

	const handleClickAllImages = (e: Event) => {
		handleClickYayImages(e)
		handleClickStockUnlimited(e)
		handleClickPexels(e)
		handleClickPixabay(e)
		handleClickUnsplash(e)
		handleClickYandexImage(e)
		handleClickBingImage(e)
		handleClickDaumImage(e)
		handleClickNaverImage(e)
		handleClickGoogleImage(e)
	}

	const handleFocus = (e: Event) => {
		textArea.select()
	}

	const handleKeydown = (e: KeyboardEvent) => {
		log('handleKeydown', e)

		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleClickAllTranslate(e)
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
	<title>MultiSearch{query ? ` — ${query}` : ''}</title>
</svelte:head>

<svelte:body on:paste={handlePaste} />

<main class="container">
	<h1>
		MultiSearch <small><a href="/doc">Help & Tips</a></small>
	</h1>

	<textarea rows="2" bind:value={query} bind:this={textArea} on:focus={handleFocus} />

	<div>
		<button on:click={handleClickAllTranslate}>All Translate</button>
		<button class="secondary" on:click={handleClickGoogleTranslate}>Google</button>
		<button class="secondary" on:click={handleClickPapago}>Papago</button>
	</div>

	<div>
		<button on:click={handleClickAllShopping}>All Shopping</button>
		<button class="secondary" on:click={handleClickDanawa}>Danawa</button>
		<button class="secondary" on:click={handleClickNaverShopping}>Naver</button>
		<button class="secondary" on:click={handleClickKakaoShopping}>Kakao</button>
		<button class="secondary" on:click={handleClickEnuri}>Enuri</button>
		<button class="secondary" on:click={handleClickJoonggoNara}>중고나라</button>
		<button class="secondary" on:click={handleClickJoonggoNaraCafe}>중고나라 카페</button>
	</div>

	<div>
		<button on:click={handleClickAllSearch}>All Search</button>
		<button class="secondary" on:click={handleClickGoogle}>Google</button>
		<button class="secondary" on:click={handleClickNaver}>Naver</button>
		<button class="secondary" on:click={handleClickDaum}>Daum</button>
		<button class="secondary" on:click={handleClickBing}>Bing</button>
		<button class="secondary" on:click={handleClickYandex}>Yandex</button>
	</div>

	<div>
		<button on:click={handleClickAllImages}>All Images</button>
		<button class="secondary" on:click={handleClickGoogleImage}>Google</button>
		<button class="secondary" on:click={handleClickNaverImage}>Naver</button>
		<button class="secondary" on:click={handleClickDaumImage}>Daum</button>
		<button class="secondary" on:click={handleClickBingImage}>Bing</button>
		<button class="secondary" on:click={handleClickYandexImage}>Yandex</button>
		<button class="secondary" on:click={handleClickUnsplash}>Unsplash</button>
		<button class="secondary" on:click={handleClickPixabay}>Pixabay</button>
		<button class="secondary" on:click={handleClickPexels}>Pexels</button>
		<button class="secondary" on:click={handleClickStockUnlimited}>StockUnlimited</button>
		<button class="secondary" on:click={handleClickYayImages}>YayImages</button>
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

		padding-left: 0.4rem;
		padding-right: 0.4rem;

		/* Undo pico css button styling */
		display: inline;
	}
</style>
