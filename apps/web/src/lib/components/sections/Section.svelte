<script lang="ts">
  import type { Snippet } from "svelte";
  import { Heading } from "$lib/components/ui/heading";

  let {
    id,
    kind,
    heading,
    description,
    missingMessage,
    children,
    headerAction,
  }: {
    id: string;
    kind: string;
    heading?: string | null;
    description?: string | null;
    missingMessage: string;
    children?: Snippet;
    headerAction?: Snippet;
  } = $props();
  const headingId = $derived(`${id}-heading`);
</script>

<section
  {id}
  class={`home-section section-${kind}`}
  aria-labelledby={heading ? headingId : undefined}
>
  {#if heading}
    <div class="section-heading">
      <div>
        <Heading level={2} id={headingId}>{heading}</Heading>
        {#if description}<p>{description}</p>{/if}
      </div>
      {@render headerAction?.()}
    </div>
    {@render children?.()}
  {:else}
    <p class="content-unavailable" role="status">{missingMessage}</p>
  {/if}
</section>
