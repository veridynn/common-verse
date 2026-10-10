<script lang="ts">
  import { localizedPath, type Locale } from "@poetry/i18n";
  import type { Author, Poem } from "@poetry/types";
  import PersonPortrait from "../../../components/PersonPortrait.svelte";
  import { Heading } from "$lib/components/ui/heading";
  import { Link } from "$lib/components/ui/link";
  import { authorDisplayName } from "$lib/editorial";
  import { contentDirection } from "$lib/homepage";

  let {
    author,
    poem,
    locale,
  }: { author: Author; poem?: Poem; locale: Locale } = $props();
  const translation = $derived(
    poem?.translations?.find((entry) => entry.language === locale),
  );
  const language = $derived(
    translation ? locale : (poem?.originalLanguage ?? "other"),
  );
</script>

<article>
  <PersonPortrait userId={author.id} image={author.portrait} />
  <Heading level={3}>
    <Link variant="heading" href={localizedPath(locale, `poets/${author.id}`)}
      >{authorDisplayName(author.name)}</Link
    >
  </Heading>
  {#if poem}
    <p
      class="poet-excerpt"
      lang={language === "other" ? "und" : language}
      dir={contentDirection(language)}
    >
      {(translation?.text ?? poem.originalText)
        .split("\n")
        .slice(0, 2)
        .join("\n")}
    </p>
  {/if}
</article>
