<script lang="ts" module>
  import { tv, type VariantProps } from 'tailwind-variants'
  import type { HTMLAttributes, HTMLAnchorAttributes } from 'svelte/elements'
  export const badgeVariants = tv({
    base: 'inline-flex max-w-full items-center gap-1 rounded-full [corner-shape:squircle] border px-2.5 py-0.5 text-sm font-semibold leading-relaxed whitespace-normal [&_svg]:size-3 [&_svg]:shrink-0',
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border text-foreground',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground'
      }
    },
    defaultVariants: { variant: 'default' }
  })
  export type BadgeVariant = VariantProps<typeof badgeVariants>['variant']
  export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
    HTMLAnchorAttributes & { variant?: BadgeVariant }
</script>

<script lang="ts">
  import { cn } from '$lib/utils'
  let {
    href,
    variant = 'default',
    class: className,
    children,
    ...restProps
  }: BadgeProps = $props()
</script>

{#if href !== undefined}
  <a
    {...restProps}
    {href}
    data-slot="badge"
    class={cn(
      badgeVariants({ variant }),
      'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring',
      className
    )}>{@render children?.()}</a
  >
{:else}
  <span
    {...restProps}
    data-slot="badge"
    class={cn(badgeVariants({ variant }), className)}
    >{@render children?.()}</span
  >
{/if}
