import debugFactory from 'debug'
const log = debugFactory('log')

export type UrlTemplateOrGenerator = string | ((query: string) => string)

// This function is not bound to any local variables.
export const makeClickHandler = (
	_query: string,
	urlTemplateOrGenerator: UrlTemplateOrGenerator
) => {
	return (e: Event) => {
		const urlTemplate =
			typeof urlTemplateOrGenerator === 'string'
				? urlTemplateOrGenerator
				: urlTemplateOrGenerator(_query)

		const queryTrimmedEncoded = encodeURIComponent(_query.trim())
		const url = urlTemplate.replace('QUERY', queryTrimmedEncoded)

		log('handleClick', url, e)

		if (url !== '') {
			window.open(url, '_blank')
		}
	}
}

// Makes function that returns different strings depending on if input contains Korean.
export const ifKorean = (ifKorean: string, ifNotKorean: string) => {
	const koreanRegex = /[\u3131-\uD79D]/giu // https://stackoverflow.com/a/38156301/117030
	return (text: string) => {
		return koreanRegex.test(text) ? ifKorean : ifNotKorean
	}
}

// Makes function that returns different strings depending on if input contains a URL.
export const ifUrl = (ifUrl: string, ifNotUrl: string) => {
	const urlRegex = /^http/iu
	return (text: string) => {
		return urlRegex.test(text) ? ifUrl : ifNotUrl
	}
}
