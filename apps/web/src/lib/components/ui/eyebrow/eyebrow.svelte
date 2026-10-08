<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  export type EyebrowProps = HTMLAttributes<HTMLElement> & { as?: 'p' | 'span' }
</script>

<script lang="ts">
  import { cn } from '$lib/utils'
  let {
    as = 'p',
    class: className,
    children,
    ...restProps
  }: EyebrowProps = $props()
</script>

<svelte:element
  this={as}
  {...restProps}
  data-slot="eyebrow"
  class={cn(className)}
>
  {@render children?.()}
</svelte:element>

<style>
  [data-slot='eyebrow'] {
    color: var(--secondary-text);
    font-size: var(--font-size-sm);
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    overflow-wrap: anywhere;
  }
</style>
