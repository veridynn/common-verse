<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  export type TextVariant = 'body' | 'lead' | 'small' | 'caption'
  export type TextProps = HTMLAttributes<HTMLElement> & {
    as?: 'p' | 'span' | 'div'
    variant?: TextVariant
    tone?: 'default' | 'muted'
  }
</script>

<script lang="ts">
  import { cn } from '$lib/utils'
  let {
    as = 'p',
    variant = 'body',
    tone = 'default',
    class: className,
    children,
    ...restProps
  }: TextProps = $props()
</script>

<svelte:element
  this={as}
  {...restProps}
  data-slot={restProps['data-slot'] ?? 'text'}
  data-variant={variant}
  data-tone={tone}
  class={cn('ui-text', className)}
>
  {@render children?.()}
</svelte:element>

<style>
  .ui-text {
    line-height: 1.6;
    overflow-wrap: anywhere;
  }
  [data-variant='lead'] {
    max-width: 44rem;
    font-size: clamp(1.15rem, 2.5vw, 1.6rem);
  }
  [data-variant='small'] {
    font-size: 0.875rem;
  }
  [data-variant='caption'] {
    font-size: 0.8125rem;
  }
  [data-tone='muted'] {
    color: var(--muted-foreground);
  }
</style>
