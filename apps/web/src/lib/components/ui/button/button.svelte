<script lang="ts">
  import type { Snippet } from 'svelte'
  import { cn } from '$lib/utils'

  let {
    href,
    class: className,
    children,
    type = 'button',
    disabled = false,
  }: {
    href?: string
    class?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    children?: Snippet
  } = $props()
</script>

{#if href}
  <a
    {href}
    class={cn(
      'inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
  >{@render children?.()}</a>
{:else}
  <button
    {type}
    {disabled}
    class={cn(
      'inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
  >{@render children?.()}</button>
{/if}
