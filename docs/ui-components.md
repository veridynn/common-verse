# UI components

Project-owned Svelte 5 primitives live in `apps/web/src/lib/components/ui`.
Import each component from its folder barrel, using `$lib/components/ui/...`.
They render server-side from Astro; add hydration only when browser events or state
require it. They use the existing semantic tokens in `src/styles/token.css`.

| Component   | Props                                                                                                       | Default                                                           |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `Button`    | `variant`: default, secondary, outline, ghost, destructive; `size`: default, sm, lg, icon, icon-sm, icon-lg | Primary, 44px minimum height                                      |
| `Link`      | Required `href`; `variant`: inline, standalone, subtle, heading                                             | Underlined inline link                                            |
| `Heading`   | Required `level`: 1–6; optional `variant`: display, title, subtitle                                         | Visual size follows the native heading and existing editorial CSS |
| `Text`      | `as`: p, span, div; `variant`: body, lead, small, caption; `tone`: default, muted                           | Body paragraph                                                    |
| `Eyebrow`   | `as`: p, span                                                                                               | Small introductory paragraph                                      |
| `Card.Root` | `as`: div, article, section, aside; `variant`: default, accent; `size`: default, sm                         | Neutral card surface                                              |
| `Badge`     | `variant`: default, secondary, outline, destructive; optional `href`                                        | Primary badge rendered as a span                                  |

Native HTML attributes, including `id`, `lang`, `dir`, ARIA attributes and event
handlers, are forwarded. Use `class` for layout; use component props for typography
and appearance. `Button` and `Link` also expose a bindable `ref` for composition
with Bits UI triggers.

`Button` renders an anchor when given `href`. A disabled button anchor has no
`href`, exposes `aria-disabled`, leaves the tab order and ignores click handlers.
Icon sizes are Button variations and require `aria-label`; hide decorative icons
from assistive technology. The default icon target is 44px square.

Heading levels express document structure independently of visual size. Text and
Eyebrow do not replace headings. Content language and direction must remain
explicit when they differ from the page locale. Links accept already-resolved
URLs: routes still use `localizedPath`, and editorial URLs still use `safeHref`.

## Svelte composition

```svelte
<script lang="ts">
  import { Button } from '$lib/components/ui/button'
  import { Link } from '$lib/components/ui/link'
  import { Heading } from '$lib/components/ui/heading'
  import { Text } from '$lib/components/ui/text'
  import { Eyebrow } from '$lib/components/ui/eyebrow'
  import { Badge } from '$lib/components/ui/badge'
  import * as Card from '$lib/components/ui/card'
  import { Sun } from 'lucide-svelte'
</script>

<Button variant="ghost" size="icon" aria-label="Appearance">
  <Sun aria-hidden="true" />
</Button>

<Eyebrow>Our programme</Eyebrow>
<Heading level={1} variant="display">Poetry across borders</Heading>
<Text variant="lead">A space for reading and writing together.</Text>
<Link href="/en/poems">Explore poems</Link>

<Card.Root as="article">
  <Card.Header>
    <Card.Title level={2}>Writing workshop</Card.Title>
    <Card.Description>Write together and share your work.</Card.Description>
    <Card.Action><Badge variant="secondary">Workshop</Badge></Card.Action>
  </Card.Header>
  <Card.Content><Text>Workshop details go here.</Text></Card.Content>
  <Card.Footer><Button href="/en/events">View events</Button></Card.Footer>
</Card.Root>
```

Card also exports `Header`, `Content`, `Footer`, `Action`, `Title` and `Description`.
`Title` composes Heading (default level 2, subtitle size), and `Description` composes
Text (default small and muted). Select the appropriate heading level at the call
site. Card parts share `--card-spacing`, which can be customized on the root.
