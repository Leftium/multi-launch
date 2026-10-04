import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'
import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import devtoolsJson from 'vite-plugin-devtools-json'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		sveltekit({
			extensions: ['.svelte', ...(mdsvexConfig.extensions ?? [])],
			preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],
			adapter: adapter(),
		}),
		devtoolsJson(),
	],
})
