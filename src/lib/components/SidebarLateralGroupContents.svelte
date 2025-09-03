<script>
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	import LateralInfo from "./LaterallInfo/LateralInfo.svelte";
	let { SidenavIconsData, activeItem } = $props();
	import TaxSearchSpecies from "./TaxSearchComponents/TaxSearchSpecies.svelte";
   import SidebarTableFilteredInfo from "./SidebarTableFilteredInfo.svelte";
   import TaxonomyBrowserLateral from "./tax_tree/TaxonomyBrowserLateral.svelte";

    console.log(SidenavIconsData);
	console.log('activeItem from groupcontents',activeItem);
</script>

<ul>

    <!-- <Sidebar.Group></Sidebar.Group> -->
    {#each SidenavIconsData.navMain as item, i (item.title)}
        <li
        class:hidden={activeItem.id !== item.id}
        >
          <!--   <a href="##">
                <item.icon />
                <span>{item.title} with it {item.id}</span>
            </a> -->
            {#if item.id=='table'}


                <div class="m-2 SidebarTableFilteredInfo_container">
                    <div class="text-lg font-bold text-left">Statistics</div>
                            <SidebarTableFilteredInfo type='list'/>

                </div>


            {/if}
                {#if item.id=='search-species'}
                <TaxSearchSpecies/>
                {/if}
           <!--  {#if item.id=='map'}

            <LateralInfo/>
            {/if} -->

            {#if item.id=='tax_tree'}

            <TaxonomyBrowserLateral/>
            {/if}
        </li>
    {/each}
</ul>