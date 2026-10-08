<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  export type CardProps = HTMLAttributes<HTMLElement> & {
    as?: 'div' | 'article' | 'section' | 'aside'
    variant?: 'default' | 'accent'
    size?: 'default' | 'sm'
  }
</script>

<script lang="ts">
  import { cn } from '$lib/utils'
  let {
    as = 'div',
    variant = 'default',
    size = 'default',
    class: className,
    children,
    ...restProps
  }: CardProps = $props()
</script>

<svelte:element
  this={as}
  {...restProps}
  data-slot="card"
  data-variant={variant}
  data-size={size}
  class={cn(className)}
>
  {@render children?.()}
</svelte:element>

<style>
  [data-slot='card'] {
    --card-spacing: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: var(--card-spacing);
    min-width: 0;
    padding-block: var(--card-spacing);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    corner-shape: squircle;
    background: var(--card);
    color: var(--card-foreground);
    box-shadow: var(--shadow-card);
  }
  [data-size='sm'] {
    --card-spacing: 1.25rem;
  }
  [data-variant='accent'] {
    border-block-start: 4px solid var(--primary);
  }
</style>
