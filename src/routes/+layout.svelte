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
			<a class="brand" href="/"
				><span class="icon">🚀</span><span class="title-text">MultiLaunch</span></a
			>
			<small><a href="/settings">Settings</a> <a href="/doc">Help&Tips</a></small>
		</h1>
	</nav>

	<slot />
</div>

<style>
	div {
		padding-left: calc(100vw - 100%);
		overflow-x: hidden;
	}

	.brand {
		color: var(--primary-color);
		text-decoration: none;
	}

	.brand .icon {
		filter: grayscale(100%);
	}

	.brand .title-text {
		display: none;
	}

	@media (min-width: 576px) {
		.brand .title-text {
			display: inline;
		}
	}

	h1 {
		margin-bottom: 0;
	}
	small {
		font-size: 42%;
		font-weight: normal;
	}
</style>
