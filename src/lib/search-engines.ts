import _ from 'lodash'

export type UrlTemplateSelector = (query: string) => string

export type SearchEngineConfig = {
	noquery?: string
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
	const urlRegex = /^https?:/iu
	const koreanRegex = /[\u3131-\uD79D]/giu // https://stackoverflow.com/a/38156301/117030

	return (text: string) => {
		text = text.trim()

		let urlTemplate = config.default

		if (urlRegex.test(text)) {
			urlTemplate = config.link ?? urlTemplate
		}

		if (koreanRegex.test(text)) {
			urlTemplate = config.lang_ko ?? urlTemplate
		}

		if (text === '') {
			urlTemplate = config.noquery ?? urlTemplate
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
	const engines = _.map(configs, (config: SearchEngineConfig, name: string) =>
		makeSearchEngine(name, config)
	)

	const handleClickAll = (e: Event) => {
		const enginesList = (e as MouseEvent).altKey ? [...engines].reverse() : engines
		enginesList.map((engine) => engine.clickHandler(e))
	}

	return {
		name: groupName,
		engines,
		handleClickAll,
	}
}
