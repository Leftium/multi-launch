import debugFactory from 'debug'
const log = debugFactory('log')

export type UrlTemplateOrSelector = string | ((query: string) => string)

type UrlConfig = {
	link?: string
	lang_ko?: string
	default: string
}

export type SearchGroupConfig = Record<string, SearchEngineConfig>

export type SearchEngineConfig = {
	url: string | UrlConfig
	excludeFromAllSearch?: boolean
}

// This function is not bound to any local variables.
export const makeClickHandler = (_query: string, urlTemplateOrSelector: UrlTemplateOrSelector) => {
	return (e: Event) => {
		const urlTemplate =
			typeof urlTemplateOrSelector === 'string'
				? urlTemplateOrSelector
				: urlTemplateOrSelector(_query)

		const queryTrimmedEncoded = encodeURIComponent(_query.trim())
		const url = urlTemplate.replace('QUERY', queryTrimmedEncoded)

		log('handleClick', url, e)

		if (url !== '') {
			window.open(url, '_blank')
		}
	}
}

// Makes function that returns a (string) url from config based on query contents.
// inputs: query, config
// output: urlTemplate
export const selectUrl = (config: SearchEngineConfig) => {
	const urlRegex = /^http/iu
	const koreanRegex = /[\u3131-\uD79D]/giu // https://stackoverflow.com/a/38156301/117030

	return (text: string) => {
		// Simple URL.
		if (typeof config.url === 'string') {
			return config.url
		}

		let urlTemplate = config.url.default

		if (urlRegex.test(text)) {
			urlTemplate = config.url.link || urlTemplate
		}

		if (koreanRegex.test(text)) {
			urlTemplate = config.url.lang_ko || urlTemplate
		}
		return urlTemplate
	}
}
