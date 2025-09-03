<script lang="ts">
	import Table from "./Table.svelte";
</script>

<h1>shadcn-ui Species Data</h1>
<section class="bg-dasrken">
	<aside class="flex">
		<div>
			<h1>Species Database</h1>
			<p>Here's the species observation data for analysis!</p>
		</div>
		<img src="/datatables/external/avatar-shadcn.png" alt="avatar" />
	</aside>

	<!-- <Table /> -->
</section>

<style>
	section {
		padding: 24px;
		border-radius: 8px;
		margin: 40px 80px 96px 0;
		min-width: 1080px;
		border: 1px solid var(--grey);
	}
	aside {
		justify-content: space-between;
		margin-bottom: 32px;
	}
	section h1 {
		font-size: 28px;
		padding: 0;
		font-weight: bold;
		margin: 0;
	}
	p {
		color: var(--font-grey);
		margin: 4px 0;
	}
	img {
		width: 48px;
		height: 48px;
	}
	section :global(footer.container) {
		border-top: none !important;
	}


</style>
