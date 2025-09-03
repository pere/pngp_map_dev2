<script>
     //@ts-nocheck

	import SidenavIconsData from "./sidebar-data.js";
	import SidebarLateralGroupContents from "./SidebarLateralGroupContents.svelte";
	import { activeItemStore } from "$lib/stores/new_sidebar_stores.js";

	import NavUser from "./nav-user.svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/context.svelte.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import CommandIcon from "@lucide/svelte/icons/command";
	import pngpIcon from "/src/static/images/pngp_icon.svg";
	import AppSidebarIcons from "./app-sidebar-icons.svelte";
	import { tax_data_joined_store } from '$lib/stores/test.svelte.js';

	let { ref = $bindable(null), ...restProps } = $props();

	//the object of the active item

	//$state('');
	//the index of the active item
	let activeIndex = $state(2);
	let activeItem = $derived(SidenavIconsData.navMain[activeIndex]);

	//$state(SidenavIconsData.navMain[activeIndex]);

	//the object of the hovered item
	let hoveredItem = $state('');
	//the index of the hovered item
	let hoveredIndex = $state('');

	//let mails = $state(SidenavIconsData.mails);
	const sidebar = useSidebar();

	$effect(()=>{
		//activeItemStore.set(SidenavIconsData.navMain[activeIndex]);
		$activeItemStore=activeItem;
		//console.log('activeItem from app-sidebar',activeItem);
	});

	function handleMenuButtonClick(item, i) {
		activeItemStore.set(item);
		activeItem = item;
		activeIndex = i;

		sidebar.setOpen(true);
	}
	function handleMenuButtonMouseEnter(item, i) {

		hoveredIndex = i;
		item.isHovered = true;
		hoveredItem = item;
	}
	function handleMenuButtonMouseLeave(item, i) {
		hoveredIndex = null;
		//console.log("onmouseleave", item.title);
		item.isHovered = false;
		hoveredItem = item;
	}

	$effect(() => {
		/* console.log("hoveredIndex", hoveredIndex);
		console.log("activeItem", activeItem);
		console.log("activeIndex", activeIndex); */
	});
</script>

<Sidebar.Root
	bind:ref
	collapsible="icon"
	class="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
	{...restProps}
>
	<!-- This is the first sidebar -->
	<!-- We disable collapsible and adjust width to icon. -->
	<!-- This will make the sidebar appear as icons. -->
	<Sidebar.Root collapsible="none" class="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r">
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>

					<Sidebar.MenuButton size="lg" class="md:h-8 md:p-0">
						{#snippet child({ props })}


							<a href="##" {...props}>
								<div
									class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
								>
									<img src={pngpIcon} alt="PNGP Icon" class="size-4" />
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-light">PNGP</span>

								</div>
							</a>
						{/snippet}
					</Sidebar.MenuButton>

				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupContent class="px-1.5 md:px-0">
					<Sidebar.Menu>
						<AppSidebarIcons
							SidenavIconsData={SidenavIconsData}
							activeIndex={activeIndex}
							hoveredIndex={hoveredIndex}
							onMenuButtonClick={handleMenuButtonClick}
							onMenuButtonMouseEnter={handleMenuButtonMouseEnter}
							onMenuButtonMouseLeave={handleMenuButtonMouseLeave}
						/>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
		<!-- <Sidebar.Footer>
			<NavUser user={data.user} />
		</Sidebar.Footer> -->
	</Sidebar.Root>

	<!-- This is the second sidebar -->
	<!-- We disable collapsible and let it fill remaining space -->
	<Sidebar.Root collapsible="none" class="hidden flex-1 md:flex">
		<Sidebar.Header class="">
			<!-- <Sidebar.Trigger class="-ml-1 size-9 absolute top-0 right-0 py-1 px-2"/> -->
			<!--   <div class="text-foreground text-base font-medium absolute top-0 right-0 py-1 px-2">
				<div class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
					<img src={pngpIcon} alt="PNGP Icon" class="size-4 items-end" />
				</div>

			   <Label class="flex items-center gap-2 text-sm">
				<span>Unreads</span>
				<Switch class="shadow-none" />
			  </Label>
			</div> -->
			<!-- <Sidebar.Input placeholder="Type to search..." /> -->
		  </Sidebar.Header>
		<Sidebar.Content class="non_overflow">
			<Sidebar.Group class="px-0">
				<Sidebar.GroupContent>

					<SidebarLateralGroupContents SidenavIconsData={SidenavIconsData} activeItem={activeItem} />

				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
	</Sidebar.Root>
</Sidebar.Root>