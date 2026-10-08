<script lang="ts">
  import { onMount, untrack } from 'svelte'
  import { Sun, Moon, Monitor } from 'lucide-svelte'
  import * as Popover from '$lib/components/ui/popover'
  import type { ThemePreference } from '$lib/theme'

  let { preference: initialPreference, label, lightLabel, darkLabel, systemLabel }: {
    preference: ThemePreference; label: string; lightLabel: string; darkLabel: string; systemLabel: string
  } = $props()
  let preference = $state(untrack(() => initialPreference))
  let hydrated = $state(false)
  let open = $state(false)
  const options = $derived([
    { value: 'light' as const, label: lightLabel, icon: Sun },
    { value: 'dark' as const, label: darkLabel, icon: Moon },
    { value: 'system' as const, label: systemLabel, icon: Monitor },
  ])
  const selected = $derived(options.find((option) => option.value === preference)!)
  onMount(() => { hydrated = true })
  function chooseTheme(value: ThemePreference) {
    preference = value
    document.documentElement.dataset.theme = value
    document.cookie = `poetry-theme=${value}; Path=/; Max-Age=31536000; SameSite=Lax`
    open = false
  }
</script>

<Popover.Root bind:open>
  <Popover.Trigger class="language-trigger theme-trigger" disabled={!hydrated} aria-label={`${label}: ${selected.label}`} title={label}>
    <selected.icon size={18} aria-hidden="true" />
  </Popover.Trigger>
  <Popover.Content class="language-popover" align="end" sideOffset={8} aria-label={label}>
    <fieldset class="theme-options">
      <legend class="language-title">{label}</legend>
      {#each options as option (option.value)}
        <label class="theme-option">
          <option.icon size={18} aria-hidden="true" />
          <span>{option.label}</span>
          <input type="radio" name="theme-preference" value={option.value} checked={preference === option.value} onchange={() => chooseTheme(option.value)} />
        </label>
      {/each}
    </fieldset>
  </Popover.Content>
</Popover.Root>
