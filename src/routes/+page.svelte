<script lang="ts">
	import '@picocss/pico'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	import * as SE from '$lib/search-engines'

	// Bindings:
	let query = $page.url.searchParams.get('q') || ''
	let textArea: HTMLTextAreaElement

	// Generate click handlers bound to local `query`.
	const makeClickHandler = (urlTemplateOrSelector: SE.UrlTemplateOrSelector) => (e: Event) => {
		SE.makeClickHandler(query, urlTemplateOrSelector)(e)
	}

	const searchGroupConfigs = {
		Translate: {
			Google: {
				url: {
					link: '',
					lang_ko: 'https://translate.google.com/?sl=ko&tl=en&text=QUERY&op=translate',
					default: 'https://translate.google.com/?sl=en&tl=ko&text=QUERY&op=translate',
				},
			},

			Papago: {
				url: {
					link: 'https://papago.naver.net/website?locale=en&source=auto&target=en&url=QUERY',
					lang_ko: 'https://papago.naver.com/?sk=ko&tk=en&hn=0&st=QUERY',
					default: 'https://papago.naver.com/?sk=en&tk=ko&hn=0&st=QUERY',
				},
			},
		},

		Shopping: {
			Danawa: {
				url: 'https://search.danawa.com/dsearch.php?k1=QUERY',
			},
			Naver: {
				url: 'https://search.shopping.naver.com/search/all?query=QUERY',
			},
			Kakao: { url: 'https://shoppinghow.kakao.com/search/QUERY' },
			Enuri: { url: 'http://www.enuri.com/search.jsp?keyword=QUERY' },
			중고나라: { url: 'https://web.joongna.com/search/QUERY' },
			'중고나라 카페': {
				url: 'http://cafe.naver.com/joonggonara?iframe_url=/joonggonara.cafe//ArticleSearchList.nhn%3Fsearch.clubid=10050146%26search.searchBy=0%26search.query=QUERY',
			},
			Homeplus: { url: 'https://front.homeplus.co.kr/search?keyword=QUERY' },
		},

		Search: {
			Google: { url: 'https://www.google.com/search?q=QUERY' },
			Naver: { url: 'https://search.naver.com/search.naver?query=QUERY' },
			Daum: { url: 'https://search.daum.net/search?q=QUERY' },
			Bing: { url: 'https://www.bing.com/search?q=QUERY' },
			Yandex: { url: 'https://yandex.com/search/?text=QUERY' },
		},

		Images: {
			Google: {
				url: {
					link: 'https://lens.google.com/uploadbyurl?url=QUERY',
					default: 'https://www.google.com/search?tbm=isch&q=QUERY',
				},
			},
			Naver: {
				url: {
					link: '',
					default: 'https://search.naver.com/search.naver?where=image&query=QUERY',
				},
			},
			Daum: { url: { link: '', default: 'https://search.daum.net/search?w=img&q=QUERY' } },
			Bing: {
				url: {
					link: 'https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:QUERY',
					default: 'https://www.bing.com/images/search?q=QUERY',
				},
			},
			Yandex: {
				url: {
					link: 'https://yandex.com/images/search?rpt=imageview&url=QUERY',
					default: 'https://yandex.com/images/search?text=QUERY',
				},
			},
			Unsplash: { url: { link: '', default: 'https://unsplash.com/s/photos/QUERY' } },
			Pixabay: { url: { link: '', default: 'https://pixabay.com/images/search/QUERY' } },
			Pexels: { url: { link: '', default: 'https://www.pexels.com/search/QUERY/' } },
			StockUnltd: {
				url: {
					link: '',
					default: 'https://www.stockunlimited.com/vector-image/?word=QUERY',
				},
			},
			YayImages: {
				url: { link: '', default: 'https://yayimages.com/search?type=-1&phrase=QUERY' },
			},
		},
	}

	const handleClickGoogleTranslate = makeClickHandler(
		SE.selectUrl(searchGroupConfigs.Translate.Google)
	)

	const handleClickPapago = makeClickHandler(SE.selectUrl(searchGroupConfigs.Translate.Papago))

	const handleClickAllTranslate = (e: Event) => {
		handleClickGoogleTranslate(e)
		handleClickPapago(e)
	}

	const handleClickDanawa = makeClickHandler(SE.selectUrl(searchGroupConfigs.Shopping.Danawa))

	const handleClickNaverShopping = makeClickHandler(
		SE.selectUrl(searchGroupConfigs.Shopping.Naver)
	)

	const handleClickKakaoShopping = makeClickHandler(
		SE.selectUrl(searchGroupConfigs.Shopping.Kakao)
	)

	const handleClickEnuri = makeClickHandler(SE.selectUrl(searchGroupConfigs.Shopping.Enuri))

	const handleClickJoonggoNara = makeClickHandler(
		SE.selectUrl(searchGroupConfigs.Shopping.중고나라)
	)

	const handleClickJoonggoNaraCafe = makeClickHandler(
		SE.selectUrl(searchGroupConfigs.Shopping['중고나라 카페'])
	)

	const handleClickHomeplus = makeClickHandler(SE.selectUrl(searchGroupConfigs.Shopping.Homeplus))

	const handleClickAllShopping = (e: Event) => {
		handleClickHomeplus(e)
		handleClickJoonggoNaraCafe(e)
		handleClickJoonggoNara(e)
		handleClickEnuri(e)
		handleClickKakaoShopping(e)
		handleClickNaverShopping(e)
		handleClickDanawa(e)
	}

	const handleClickGoogle = makeClickHandler(SE.selectUrl(searchGroupConfigs.Search.Google))
	const handleClickNaver = makeClickHandler(SE.selectUrl(searchGroupConfigs.Search.Naver))
	const handleClickDaum = makeClickHandler(SE.selectUrl(searchGroupConfigs.Search.Daum))
	const handleClickBing = makeClickHandler(SE.selectUrl(searchGroupConfigs.Search.Bing))
	const handleClickYandex = makeClickHandler(SE.selectUrl(searchGroupConfigs.Search.Yandex))

	const handleClickAllSearch = (e: Event) => {
		handleClickYandex(e)
		handleClickBing(e)
		handleClickDaum(e)
		handleClickNaver(e)
		handleClickGoogle(e)
	}

	const handleClickGoogleImage = makeClickHandler(SE.selectUrl(searchGroupConfigs.Images.Google))
	const handleClickYandexImage = makeClickHandler(SE.selectUrl(searchGroupConfigs.Images.Yandex))
	const handleClickBingImage = makeClickHandler(SE.selectUrl(searchGroupConfigs.Images.Bing))
	const handleClickNaverImage = makeClickHandler(SE.selectUrl(searchGroupConfigs.Images.Naver))
	const handleClickDaumImage = makeClickHandler(SE.selectUrl(searchGroupConfigs.Images.Daum))
	const handleClickUnsplash = makeClickHandler(SE.selectUrl(searchGroupConfigs.Images.Unsplash))
	const handleClickPixabay = makeClickHandler(SE.selectUrl(searchGroupConfigs.Images.Pixabay))
	const handleClickPexels = makeClickHandler(SE.selectUrl(searchGroupConfigs.Images.Pexels))
	const handleClickStockUnlimited = makeClickHandler(
		SE.selectUrl(searchGroupConfigs.Images.StockUnltd)
	)
	const handleClickYayImages = makeClickHandler(SE.selectUrl(searchGroupConfigs.Images.YayImages))

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
		<button class="secondary" on:click={handleClickHomeplus}>Homeplus</button>
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
		<button class="secondary" on:click={handleClickStockUnlimited}>StockUnltd</button>
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

		padding-left: 0.3rem;
		padding-right: 0.3rem;

		/* Undo pico css button styling */
		display: inline;
	}
</style>
