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

export type SearchEngine = {
	name: string
	getUrlTemplate: (query: string) => string
	clickHandler: EventHandler
}

export type SearchGroup = {
	name: string
	engines: SearchEngine[]
	handleClickAll: EventHandler
}

// This function is not bound to any local variables.
export const makeEngineFunctions = (
	query: string,
	urlTemplateOrSelector: UrlTemplateOrSelector
) => {
	const getUrlTemplate = (query: string) =>
		typeof urlTemplateOrSelector === 'string'
			? urlTemplateOrSelector
			: urlTemplateOrSelector(query)
	return {
		getUrlTemplate,
		clickHandler: (e: Event) => {
			const urlTemplate = getUrlTemplate(query)
			const queryTrimmedEncoded = encodeURIComponent(query.trim())
			const url = urlTemplate.replace('QUERY', queryTrimmedEncoded)

			log('handleClick', url, e)

			if (url !== '') {
				window.open(url, '_blank')
			}
		},
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
			urlTemplate = config.url.link ?? urlTemplate
		}

		if (koreanRegex.test(text)) {
			urlTemplate = config.url.lang_ko ?? urlTemplate
		}
		return urlTemplate
	}
}

type EventHandler = (e: Event) => void
type makeEngineFunctionsType = (urlTemplateOrSelector: UrlTemplateOrSelector) => {
	getUrlTemplate: (query: string) => string
	clickHandler: EventHandler
}

export const makeSearchEngine = (
	name: string,
	config: SearchEngineConfig,
	makeEngineFunctions: makeEngineFunctionsType
) => {
	const { clickHandler, getUrlTemplate } = makeEngineFunctions(selectUrl(config))

	log(clickHandler)

	return {
		name,
		getUrlTemplate,
		clickHandler,
	}
}

export const makeSearchGroup = (
	groupName: string,
	configs: SearchGroupConfig,
	makeEngineFunctions: makeEngineFunctionsType
) => {
	const engines: SearchEngine[] = []
	for (const [name, config] of Object.entries(configs)) {
		engines.push(makeSearchEngine(name, config, makeEngineFunctions))
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
