<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6
  export type HeadingVariant = 'display' | 'title' | 'subtitle'
  export type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
    level: HeadingLevel
    variant?: HeadingVariant
  }
</script>

<script lang="ts">
  import { cn } from '$lib/utils'
  let {
    level,
    variant,
    class: className,
    children,
    ...restProps
  }: HeadingProps = $props()
  const tag = $derived(`h${level}`)
</script>

<svelte:element
  this={tag}
  {...restProps}
  data-slot={restProps['data-slot'] ?? 'heading'}
  data-variant={variant}
  class={cn('ui-heading', className)}
>
  {@render children?.()}
</svelte:element>

<style>
  .ui-heading {
    font-family: var(--font-serif);
    line-height: 1.05;
    text-wrap: balance;
    overflow-wrap: anywhere;
  }
  [data-variant='display'] {
    font-size: clamp(3rem, 9vw, 7.5rem);
    font-weight: 500;
  }
  [data-variant='title'] {
    font-size: clamp(1.6rem, 4vw, 2.5rem);
    font-weight: 500;
  }
  [data-variant='subtitle'] {
    font-size: 1.5rem;
    line-height: 1.4;
    font-weight: 500;
  }
</style>
