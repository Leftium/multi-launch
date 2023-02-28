<script lang="ts">
	import '../app.scss'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	import { beforeNavigate } from '$app/navigation'

	import { didBeforeNavigate } from '$lib/stores'

	beforeNavigate((navigation) => {
		log('beforeNavigate', navigation)
		didBeforeNavigate.set(true)
	})
</script>

<div>
	<nav class="container">
		<h1>
			<a class="brand" href="/">MultiLaunch</a>
			<small><a href="/settings">Settings</a> <a href="/doc">Help&Tips</a></small>
		</h1>
	</nav>

	<slot />
</div>

<style>
	div {
		padding-left: calc(100vw - 100%);
	}

	.brand {
		color: var(--primary-color);
		text-decoration: none;
	}

	h1 {
		margin-bottom: 0;
	}
	small {
		font-size: 42%;
		font-weight: normal;
	}
</style>
