<script lang="ts">
	import type { PageData } from './$types'

	export let data: PageData
</script>

<main class="container">
	<textarea class="query" />
	<div class="buttons">
		<button>Button 1</button>
		<button>Button 2</button>
		<button>Button 3</button>
		<button>Button 4</button>
		<button>Button 5</button>
		<button>Button 6</button>
	</div>
</main>

<style>
	main {
		border: solid 20px green;

		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;

		display: grid;

		grid-template-columns: 100%;
		grid-template-rows: 1fr 1fr env(keyboard-inset-height, 0px);
		grid-template-areas:
			'query'
			'buttons'
			'keyboard';

		grid-auto-rows: 0;
		overflow: hidden;
	}

	main:focus-within {
		grid-template-rows: 1fr env(keyboard-inset-height, 0px);
		grid-template-areas:
			'query'
			'keyboard';
	}

	.query {
		grid-area: query;
		background: pink;
		height: 100%;
	}

	.buttons {
		grid-area: buttons;
		height: 100%;
	}
</style>
