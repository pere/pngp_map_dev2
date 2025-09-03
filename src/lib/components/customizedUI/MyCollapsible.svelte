<script lang="ts">
  import { Collapsible, type WithoutChild } from "bits-ui";

  type Props = WithoutChild<Collapsible.RootProps> & {
    buttonText: string;
  };

  let {
    open = $bindable(false),
    ref = $bindable(null),
    buttonText,
    children,
    ...restProps
  }: Props = $props();
</script>

<Collapsible.Root bind:open bind:ref {...restProps}>
  <Collapsible.Trigger>{buttonText}</Collapsible.Trigger>
  <Collapsible.Content class="bg-amber-300 font-white">
    {@render children?.()}
  </Collapsible.Content>
</Collapsible.Root>