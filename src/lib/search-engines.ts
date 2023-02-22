import debugFactory from 'debug'

export type UrlTemplateSelector = (query: string) => string

export type SearchEngineConfig = {
	link?: string
	lang_ko?: string
	default: string
}

export type SearchGroupConfigs = Record<string, SearchEngineConfig>

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

// Makes function that returns a (string) url from config based on query contents.
// inputs: query, config
// output: urlTemplate
export const makeUrlTemplateSelector = (config: SearchEngineConfig) => {
	const urlRegex = /^http/iu
	const koreanRegex = /[\u3131-\uD79D]/giu // https://stackoverflow.com/a/38156301/117030

	return (text: string) => {
		let urlTemplate = config.default

		if (urlRegex.test(text)) {
			urlTemplate = config.link ?? urlTemplate
		}

		if (koreanRegex.test(text)) {
			urlTemplate = config.lang_ko ?? urlTemplate
		}
		return urlTemplate
	}
}

type EventHandler = (e: Event) => void

export const makeSearchGroup = (
	groupName: string,
	configs: SearchGroupConfigs,
	makeSearchEngine: (name: string, config: SearchEngineConfig) => SearchEngine
) => {
	const engines: SearchEngine[] = []
	for (const [name, config] of Object.entries(configs)) {
		engines.push(makeSearchEngine(name, config))
	}

	const handleClickAll = (e: Event) => {
		const enginesList = (e as MouseEvent).altKey ? [...engines].reverse() : engines
		for (const searchEngine of enginesList) {
			searchEngine.clickHandler(e)
		}
	}

	return {
		name: groupName,
		engines,
		handleClickAll,
	}
}
