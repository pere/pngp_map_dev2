<script>
	import { Menubar as MenubarPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	} = $props();
</script>

<MenubarPrimitive.Trigger
	bind:ref
	data-slot="font-light"
	class={cn(
		"focus:bg-accent bg-amber-100 focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground outline-hidden flex select-none items-center rounded-sm px-2 py-1 text-sm font-light",
		className
	)}
	{...restProps}
/>