<script>
	//@ts-nocheck
	//@ts-nocheck
	import AppSidebar from "$lib/components/app-sidebar.svelte";
	import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { activeItemStore,filteredTaxInputStore } from "$lib/stores/new_sidebar_stores.js";
	import SidenavIconsData from "$lib/components/sidebar-data.js";
	import Test from "$lib/components/MapComponents/Test.svelte";
	import MainMap from "$lib/components/MapComponents/MainMap.svelte";
	import TaxonomyBrowserMain from "$lib/components/tax_tree/TaxonomyBrowserMain.svelte";
	import Table from "$lib/components/Table/Table.svelte";


let page=$state('test')
let Title=$derived.by(()=>{
	return $activeItemStore.title
})
$effect(()=>{
console.log('activeItemStore from page.svelte',$activeItemStore)
})
//$state('test')
console.log('icons',SidenavIconsData.navMain);
	$effect(() => {
		console.log('filteredTaxInputStore from main page',$filteredTaxInputStore);
	});

</script>

<Sidebar.Provider style="--sidebar-width: 22vw">
	<AppSidebar />
	<Sidebar.Inset>
		<header class="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
			<Sidebar.Trigger class="-ml-1 cursor-pointer" />
			<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
			 <Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item class="hidden md:block">
						<Breadcrumb.Link class="text-lg font-bold">P.N. Gran Paradiso</Breadcrumb.Link>
						</Breadcrumb.Item>
					<Breadcrumb.Separator class="hidden md:block" />
					<Breadcrumb.Item>
						<Breadcrumb.Page>{Title}</Breadcrumb.Page>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</header>
		<div class="ml-0 mr-0 h-[calc(100%-1rem)] w-full rounded-lg">
			<!-- {#each Array.from({ length: 24 }) as _, index (index)} -->


					{#each SidenavIconsData.navMain	 as item, i (item.id)}
						<div class="bg-card"
						class:sel={$activeItemStore.id == item.id}
						class:hidden={$activeItemStore.id !== item.id}
						>

						{#if item.id=='general-pngp-info'}
						<div class="relative isolate px-6 pt-14 lg:px-8">

							<div class="text-center">
								<h1 class="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">Parco Nazionale del Gran Paradiso</h1>
								<p class="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
									Use this website to explore the data of the Parc</p>
								<div class="mt-10 flex items-center justify-center gap-x-6">
								  <a href="#" class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Get started</a>
								  <a href="https://www.pngp.it/en/national-park" target="_blank" class="text-sm/6 font-semibold text-gray-900">Learn more about PNGP<span aria-hidden="true">→</span></a>
								</div>
							  </div>
							  </div>

						{/if}
						{#if item.id=='table'}
						<!-- <h3>table</h3> -->
							<Table/>

						{/if}
					   {#if item.id=='map'}
					     <Test/>


					   <h4>{item.title}</h4>
					  {/if}
					{#if item.id=='search-species'}
					<MainMap/>


					{/if}

					{#if item.id=='tax_tree'}
					<TaxonomyBrowserMain/>


					{/if}

					<!-- {$activeItemStore.id} -->
				</div>
			{/each}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
<style>
	.sel{
		/* background-color: red; */
	}
</style>