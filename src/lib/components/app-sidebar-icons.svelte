<script>
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  export let SidenavIconsData;
  export let activeIndex;
  export let hoveredIndex;
  export let onMenuButtonClick;
  export let onMenuButtonMouseEnter;
  export let onMenuButtonMouseLeave;

</script>

{#each SidenavIconsData.navMain as item, i (item.title)}
  <Sidebar.MenuItem>
    <Sidebar.MenuButton
      tooltipContentProps={{ hidden: false }}
      onclick={() => onMenuButtonClick(item, i)}
      onmouseenter={() => onMenuButtonMouseEnter(item, i)}
      onmouseleave={() => onMenuButtonMouseLeave(item, i)}
      isActive={activeIndex === i}
      isHovered={hoveredIndex === i}
      class="pr-1  md:px-2 text-gray-500 border-1 border-gray-300 rounded-md"
    >
      {#snippet tooltipContent()}
        {item.title}
      {/snippet}
      <item.icon class="stroke-[2]" />
      <span>{item.title}</span>
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
{/each}