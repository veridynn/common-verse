<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '$lib/utils'
  let {
    class: className,
    children,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> = $props()
</script>

<div
  {...restProps}
  data-slot="card-footer"
  class={cn('flex flex-wrap items-center gap-2', className)}
>
  {@render children?.()}
</div>

<style>
  div {
    min-width: 0;
    padding-inline: var(--card-spacing);
  }
</style>
