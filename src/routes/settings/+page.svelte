<script lang="ts">
	let textArea: HTMLTextAreaElement
	let text: string
</script>

<main class="container">
	<button>Preview</button>

	<textarea rows="40" bind:value={text} bind:this={textArea} />
</main>

<style>
	main button {
		/* Undo pico css button styling */
		width: auto;
		display: inline;
	}
</style>
