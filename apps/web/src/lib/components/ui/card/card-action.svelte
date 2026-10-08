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
  data-slot="card-action"
  class={cn(
    'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
    className
  )}
>
  {@render children?.()}
</div>

<style>
  div {
    min-width: 0;
  }
</style>
