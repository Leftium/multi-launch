export const config = {
	Translate: {
		engines: {
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
