<script lang="ts">
  import { cn } from '$lib/utils'
  import { Heading, type HeadingProps } from '$lib/components/ui/heading'
  let {
    class: className,
    level = 2,
    variant = 'subtitle',
    children,
    ...restProps
  }: Omit<HeadingProps, 'level'> & { level?: HeadingProps['level'] } = $props()
</script>

<Heading
  {...restProps}
  {level}
  {variant}
  data-slot="card-title"
  class={cn('m-0', className)}>{@render children?.()}</Heading
>
