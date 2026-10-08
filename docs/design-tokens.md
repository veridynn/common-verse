# Colour and appearance

Tokens live in `apps/web/src/styles/global.css`. The primary yellow is **#F1A60A**,
the old website's `--bs-primary`. The `brand-50` to `brand-900` ramp supplies
lighter surfaces and deeper shades. Yellow actions use dark text; small yellow
text uses the darker `primary-text` token for contrast in light mode.

Use semantic tokens in components instead of choosing brand shades directly:

| Role                 | Tokens                                                                       |
| -------------------- | ---------------------------------------------------------------------------- |
| Page and text        | `background`, `foreground`                                                   |
| Cards and popovers   | `card`, `card-foreground`, `popover`, `popover-foreground`                   |
| Main action          | `primary`, `primary-foreground`, `primary-hover`                             |
| Supporting surfaces  | `secondary`, `muted`, `accent`, each with `-foreground`                      |
| Boundaries and focus | `border`, `input`, `ring`                                                    |
| Status               | `success`, `warning`, `error`, `info`, each with `-foreground` and `-subtle` |

Tailwind exposes these as utilities such as `bg-primary text-primary-foreground`
and `bg-error-subtle text-error`. `destructive` aliases the error palette.
Do not communicate status through colour alone; add clear text or an icon with a
text label. Compatibility aliases `paper`, `ink`, `soft`, and `white` keep the
existing editorial pages on the same theme.

The appearance picker offers Light, Dark, and System. System is the default and
follows the device preference, including when JavaScript is disabled. CSS
`light-dark()` values adapt through `color-scheme`. Explicit choices are saved in
a first-party `poetry-theme` cookie for one year and applied during server rendering
to avoid a light flash on dark pages. The cookie contains only the appearance
preference and is shared across locale routes.

Pickers use project-owned shadcn-svelte Popover components backed by Bits UI.
The language picker also renders a native details fallback without JavaScript.
These primitives and CSS tokens can be replaced independently of CMS content.

Browser verification covers keyboard opening and focus return, theme persistence,
system changes, language navigation, 320px layouts, and axe checks in German and
Arabic. These checks cover the implemented prototype, not a complete WCAG audit.
