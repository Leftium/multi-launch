import { sveltekit } from '@sveltejs/kit/vite'
import { ViteToml } from 'vite-plugin-toml'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [sveltekit(), ViteToml()],
})
