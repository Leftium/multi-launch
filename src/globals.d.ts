// https://github.com/pngwn/MDsveX/discussions/369
declare module '*.md'

declare module '*.toml' {
	const value: unknown
	export default value
}
