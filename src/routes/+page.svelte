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
			engines: {
				Google: {
					url: {
						link: '',
						lang_ko:
							'https://translate.google.com/?sl=ko&tl=en&text=QUERY&op=translate',
						default:
							'https://translate.google.com/?sl=en&tl=ko&text=QUERY&op=translate',
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
		},

		Shopping: {
			engines: {
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
		},

		Search: {
			engines: {
				Google: { url: 'https://www.google.com/search?q=QUERY' },
				Naver: { url: 'https://search.naver.com/search.naver?query=QUERY' },
				Daum: { url: 'https://search.daum.net/search?q=QUERY' },
				Bing: { url: 'https://www.bing.com/search?q=QUERY' },
				Yandex: { url: 'https://yandex.com/search/?text=QUERY' },
			},
		},

		Images: {
			engines: {
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
				Daum: {
					url: { link: '', default: 'https://search.daum.net/search?w=img&q=QUERY' },
				},
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
		},
	}

	type SearchEngine = {
		name: string
		clickHandler: (e: Event) => void
	}

	type SearchGroup = {
		name: string
		engines: SearchEngine[]
		handleClickAll: (e: Event) => void
	}

	const makeSearchGroup = (groupName: string, configs: SE.SearchGroupConfig) => {
		const engines: SearchEngine[] = []
		for (const [name, config] of Object.entries(configs)) {
			engines.push(makeSearchEngine(name, config))
		}

		const handleClickAll = (e: Event) => {
			for (const searchEngine of engines) {
				searchEngine.clickHandler(e)
			}
		}

		return {
			name: groupName,
			engines,
			handleClickAll,
		}
	}

	const makeSearchEngine = (name: string, config: SE.SearchEngineConfig) => {
		const clickHandler = makeClickHandler(SE.selectUrl(config))

		return {
			name,
			clickHandler,
		}
	}

	const searchGroups: SearchGroup[] = []

	for (const [name, config] of Object.entries(searchGroupConfigs)) {
		searchGroups.push(makeSearchGroup(name, config.engines))
	}

	const handleFocus = (e: Event) => {
		textArea.select()
	}

	const handleKeydown = (e: KeyboardEvent) => {
		log('handleKeydown', e)

		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			// handleClickAllTranslate(e)
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

	{#each searchGroups as searchGroup}
		<div>
			<button on:click={searchGroup.handleClickAll}>All {searchGroup.name}</button
			>{#each searchGroup.engines as engine}
				<button class="secondary" on:click={engine.clickHandler}>{engine.name}</button>
			{/each}
		</div>
	{/each}
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
		margin: 0.1rem;

		font-size: 0.9rem;

		padding-left: 0.3rem;
		padding-right: 0.3rem;

		/* Undo pico css button styling */
		display: inline;
	}
</style>
