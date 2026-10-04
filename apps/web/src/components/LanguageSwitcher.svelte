<script lang="ts">
  import { localeMetadata, locales, type Locale } from '@poetry/i18n'

  let { currentLocale, label }: { currentLocale: Locale; label: string } = $props()

  function switchLocale(event: Event) {
    const nextLocale = (event.currentTarget as HTMLSelectElement).value
    const segments = window.location.pathname.split('/').filter(Boolean)
    if (segments.length && locales.includes(segments[0] as Locale)) segments[0] = nextLocale
    else segments.unshift(nextLocale)
    window.location.assign(`/${segments.join('/')}${window.location.search}`)
  }
</script>

<label class="language-switcher">
  <span class="sr-only">{label}</span>
  <select aria-label={label} value={currentLocale} onchange={switchLocale}>
    {#each locales as locale}
      <option value={locale}>{localeMetadata[locale].label}</option>
    {/each}
  </select>
</label>
