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
      'inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent',
      className,
    )}
  >{@render children?.()}</a>
{:else}
  <button
    {type}
    {disabled}
    class={cn(
      'inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent',
      className,
    )}
  >{@render children?.()}</button>
{/if}
