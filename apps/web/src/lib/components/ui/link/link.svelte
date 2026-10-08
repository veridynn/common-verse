<script lang="ts" module>
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  export type LinkVariant = 'inline' | 'standalone' | 'subtle' | 'heading'
  export type LinkProps = HTMLAnchorAttributes & {
    href: string
    variant?: LinkVariant
    ref?: HTMLAnchorElement | null
  }
</script>

<script lang="ts">
  import { cn } from '$lib/utils'
  let {
    href,
    variant = 'inline',
    class: className,
    children,
    ref = $bindable(null),
    ...restProps
  }: LinkProps = $props()
</script>

<a
  {...restProps}
  bind:this={ref}
  {href}
  data-slot="link"
  data-variant={variant}
  class={cn(className)}
>
  {@render children?.()}
</a>

<style>
  a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 0.2em;
    overflow-wrap: anywhere;
  }
  a[data-variant='standalone'] {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
  }
  a[data-variant='subtle'] {
    color: var(--muted-foreground);
  }
  a[data-variant='heading'] {
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
    text-decoration-thickness: 0.14em;
  }
  a:focus-visible {
    outline: 3px solid var(--ring);
    outline-offset: 4px;
  }
</style>
