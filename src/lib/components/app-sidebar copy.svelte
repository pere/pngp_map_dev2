<script module>

	import SidenavIconsData from "./sidebar-data.js";
</script>

<script>
	import NavUser from "./nav-user.svelte";
	import { Label } from "$lib/components/ui/label/index.js";
	import { useSidebar } from "$lib/components/ui/sidebar/context.svelte.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import { Switch } from "$lib/components/ui/switch/index.js";
	import CommandIcon from "@lucide/svelte/icons/command";
	let { ref = $bindable(null), ...restProps } = $props();

	let activeItem = $state('');
	let activeIndex = $state('');
	let hoveredItem = $state('');
	let hoveredIndex = $state('');

	let mails = $state(SidenavIconsData.mails);
	const sidebar = useSidebar();

	$effect(() => {
		console.log("hoveredIndex", hoveredIndex);
		console.log("activeItem", activeItem);
		console.log("activeIndex", activeIndex);
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
									<CommandIcon class="size-4" />
								</div>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-light">Acme Inc</span>
									<span class="truncate text-xs">Enterprise</span>
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

						<!-- Sidebar.MenuButton isActive={hoveredItem.title === item.title} -->
						<!-- data-hovered={hoveredIndex === i} -->
						{#each SidenavIconsData.navMain as item,i (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									tooltipContentProps={{
										hidden: false,
									}}
									onclick={() => {

										activeItem = item;
										activeIndex = i;
										// item.isActive = !item.isActive;
										const mail = SidenavIconsData.mails.sort(() => Math.random() - 0.5);
										mails = mail.slice(
											0,
											Math.max(5, Math.floor(Math.random() * 10) + 1)
										);
										sidebar.setOpen(true);
									}}
									onmouseenter={() => {
										console.log("onmouseenter", item.title);
										hoveredIndex = i

										item.isHovered = true;

										hoveredItem = item;
									}}
									onmouseleave={() => {
										hoveredIndex = null;
										console.log("onmouseleave", item.title);
										item.isHovered = false;
										hoveredItem = item;
									}}
									isActive={activeIndex === i}
									isHovered={hoveredIndex === i}



									class="px-2.5 md:px-2"
								>
									{#snippet tooltipContent()}
										{item.title} as being hovered {item.isHovered}, active {item.isActive}
									{/snippet}
									<item.icon />

									<span>{item.title}</span>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
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
		<Sidebar.Header class="gap-3.5 border-b p-4">
			<div class="flex w-full items-center justify-between">
				<div class="text-foreground text-base font-light">
					{hoveredItem.title}
				</div>
				<Label class="flex items-center gap-2 text-sm">
					<span>Unreads</span>
					<Switch class="shadow-none" />
				</Label>
			</div>
			<Sidebar.Input placeholder="Type to search..." />
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group class="px-0">
				<Sidebar.GroupContent>
					{#each mails as mail (mail.email)}
						<a
							href="##"
							class="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0"
						>
							<div class="flex w-full items-center gap-2">
								<span>{mail.name}</span>
								<span class="ml-auto text-xs">{mail.date}</span>
							</div>
							<span class="font-light">{mail.subject}</span>
							<span class="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
								{mail.teaser}
							</span>
						</a>
					{/each}
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>
	</Sidebar.Root>
</Sidebar.Root>