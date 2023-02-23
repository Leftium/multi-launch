<script lang="ts">
	import '@picocss/pico'

	let textArea: HTMLTextAreaElement
	let text: string
</script>

<main class="container">
	<textarea rows="10" bind:value={text} bind:this={textArea} />
</main>
