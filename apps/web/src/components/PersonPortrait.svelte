<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements'
  import type { MediaReference } from '@poetry/types'
  import { personPortrait } from '$lib/portraits'
  import { cn } from '$lib/utils'

  let {
    userId,
    image,
    class: className,
    loading = 'lazy',
    ...restProps
  }: Omit<HTMLImgAttributes, 'src' | 'alt'> & {
    userId: number | string
    image?: MediaReference | number | string | null
  } = $props()
  const portrait = $derived(personPortrait(userId, image))
</script>

<img
  {...restProps}
  data-slot="avatar"
  src={portrait.src}
  alt={portrait.alt}
  width="720"
  height="720"
  {loading}
  decoding="async"
  class={cn('block aspect-square w-full rounded-lg [corner-shape:squircle] object-cover', className)}
/>
