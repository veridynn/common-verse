<script lang="ts">
  import { localizedPath, type Locale } from "@poetry/i18n";
  import type { Workshop } from "@poetry/types";
  import { Heading } from "$lib/components/ui/heading";
  import { Link } from "$lib/components/ui/link";
  import * as m from "../../../paraglide/messages.js";

  let { event, locale }: { event: Workshop; locale: Locale } = $props();
  const dateFormat = $derived(
    new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Europe/Berlin",
    }),
  );
  const href = $derived(localizedPath(locale, `workshops/${event.slug}`));
</script>

<article>
  <div class="event-date">
    <time datetime={event.startDate}
      >{dateFormat.format(new Date(event.startDate))}</time
    >
  </div>
  <div class="event-copy">
    <p class="event-kind">
      {event.kind === "event"
        ? m.home_event({}, { locale })
        : m.workshop_label({}, { locale })}
    </p>
    <Heading level={3}
      ><Link variant="heading" {href}>{event.title}</Link></Heading
    >
    {#if event.location}<p>{event.location}</p>{/if}
    {#if event.description}<p>{event.description}</p>{/if}
  </div>
  <Link
    class="event-details"
    {href}
    aria-label={`${m.home_event_details({}, { locale })}: ${event.title}`}
    >{m.home_event_details({}, { locale })}</Link
  >
</article>
