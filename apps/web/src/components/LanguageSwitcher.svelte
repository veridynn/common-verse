<script lang="ts">
  import { onMount } from 'svelte'
  import { localeMetadata, locales, localizedPath, type Locale } from '@poetry/i18n'
  import { Languages, ChevronDown, Check } from 'lucide-svelte'
  import * as Popover from '$lib/components/ui/popover'

  let { currentLocale, label, path = '/', search = '' }: {
    currentLocale: Locale; label: string; path?: string; search?: string
  } = $props()
  let hydrated = $state(false)
  let hash = $state('')
  const current = $derived(localeMetadata[currentLocale])
  const triggerLabel = $derived(`${currentLocale.toUpperCase()} — ${label}: ${current.label}`)
  onMount(() => {
    hydrated = true
    const updateHash = () => { hash = window.location.hash }
    updateHash()
    window.addEventListener('hashchange', updateHash)
    return () => window.removeEventListener('hashchange', updateHash)
  })
</script>

{#snippet triggerContent()}
  <Languages size={18} aria-hidden="true" />
  <span class="language-name" lang={currentLocale} dir={current.direction}>{current.label}</span>
  <span class="language-code" aria-hidden="true">{currentLocale.toUpperCase()}</span>
  <ChevronDown size={16} aria-hidden="true" class="language-chevron" />
{/snippet}

{#snippet languageLinks()}
  <p class="language-title">{label}</p>
  <ul class="language-options">
    {#each locales as locale (locale)}
      <li>
        <a href={`${localizedPath(locale, path)}${search}${hash}`} hreflang={locale}
          aria-current={locale === currentLocale ? 'page' : undefined}>
          <span lang={locale} dir={localeMetadata[locale].direction}>{localeMetadata[locale].label}</span>
          {#if locale === currentLocale}<Check size={18} aria-hidden="true" />{/if}
        </a>
      </li>
    {/each}
  </ul>
{/snippet}

<div class="language-switcher">
  {#if hydrated}
    <Popover.Root>
      <Popover.Trigger class="language-trigger" aria-label={triggerLabel} title={`${label}: ${current.label}`}>
        {@render triggerContent()}
      </Popover.Trigger>
      <Popover.Content class="language-popover" align="end" sideOffset={8} dir={current.direction} aria-label={label}>
        {@render languageLinks()}
      </Popover.Content>
    </Popover.Root>
  {:else}
    <details class="language-fallback">
      <summary class="language-trigger" aria-label={triggerLabel} title={`${label}: ${current.label}`}>
        {@render triggerContent()}
      </summary>
      <div class="language-popover" dir={current.direction}>{@render languageLinks()}</div>
    </details>
  {/if}
</div>
