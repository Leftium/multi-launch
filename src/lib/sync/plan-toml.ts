import TOML from '@ltd/j-toml'

export function validateSyncedToml(text: string) {
	const { title, ...groups } = TOML.parse(text)
	if (title !== undefined && typeof title !== 'string') {
		throw new Error('A plan title must be text.')
	}

	for (const [group, engines] of Object.entries(groups)) {
		if (!isTable(engines)) throw new Error(`Expected a table for ${group}.`)
		for (const [name, engine] of Object.entries(engines)) {
			if (!isTable(engine) || typeof engine.default !== 'string') {
				throw new Error(`${group}.${name} needs a default URL.`)
			}
			for (const key of ['default', 'ifquery', 'iflink', 'lang_ko']) {
				const template = engine[key]
				if (template === undefined || template === '') continue
				if (typeof template !== 'string' || !isWebUrl(template.replace('QUERY', 'query'))) {
					throw new Error(
						`${group}.${name} has an invalid ${key} URL. Use HTTP(S) or a relative URL.`
					)
				}
			}
			if (engine.target !== undefined && typeof engine.target !== 'string') {
				throw new Error(`${group}.${name} has an invalid target.`)
			}
		}
	}
	return typeof title === 'string' ? title : undefined
}

export function isWebUrl(value: string) {
	try {
		return ['http:', 'https:'].includes(new URL(value, 'https://example.invalid/').protocol)
	} catch {
		return false
	}
}

function isTable(value: unknown): value is Record<string, unknown> {
	return Object.prototype.toString.call(value) === '[object Object]'
}
