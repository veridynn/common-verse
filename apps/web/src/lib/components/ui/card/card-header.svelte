<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'
  let {
    class: className,
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> = $props()
</script>

<div {...restProps} data-slot="card-header" class={cn('grid gap-fluid-2xs', className)}>
  {@render children?.()}
</div>

<style>
  div {
    min-width: 0;
    padding-inline: var(--card-spacing);
    grid-template-columns: minmax(0, 1fr);
  }
  div:has(> :global([data-slot='card-action'])) {
    grid-template-columns: minmax(0, 1fr) auto;
  }
  div > :global([data-slot='card-title']),
  div > :global([data-slot='card-description']) {
    grid-column: 1;
  }
</style>
