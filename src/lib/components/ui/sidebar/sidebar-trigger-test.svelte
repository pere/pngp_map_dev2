<script>
	// @ts-nocheck
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils.js";
	import PanelLeftIcon from "@lucide/svelte/icons/panel-left";
	import MinimizeIcon from "@lucide/svelte/icons/minimize-2";
	import { useSidebar } from "./context.svelte.js";

	let {
		ref = $bindable(null),
		class: className,
		onclick,
		...restProps
	} = $props();

	const sidebar = useSidebar();

	// Reactive variant based on sidebar state
	let buttonVariant = $derived.by(() => {
		const isExpanded = sidebar.state === 'expanded';
		alert(isExpanded)
		console.log('sidebar state:', sidebar.state, 'isExpanded:', isExpanded);
		return isExpanded ? "absolute" : "hidden";
	});

	// Reactive class for additional styling
	let buttonClass = $derived(() => {
		return cn(
			"size-7 transition-all duration-200",
			className
		);
	});
</script>
<Button
	data-sidebar="trigger"
	data-slot="sidebar-trigger"
	variant={buttonVariant}
	size="icon"
	class={buttonClass}
	type="button"
	disabled={false}
	onclick={(e) => {
		onclick?.(e);
		console.log('Toggle clicked, current state:', sidebar.state);
		sidebar.toggle();
	}}
	{...restProps}
>
	<MinimizeIcon />
	<span class="sr-only">Toggle Sidebar</span>
</Button>