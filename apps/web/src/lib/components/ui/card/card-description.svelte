<script lang="ts">
  import { Text, type TextProps } from '$lib/components/ui/text'
  import { cn } from '$lib/utils'
  let { class: className, children, ...restProps }: TextProps = $props()
</script>

<Text
  variant="small"
  tone="muted"
  {...restProps}
  data-slot="card-description"
  class={cn('m-0', className)}>{@render children?.()}</Text
>
