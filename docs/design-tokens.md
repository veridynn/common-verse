# Colour and appearance

Tokens live in `apps/web/src/styles/global.css`. The primary yellow is **#F1A60A**,
the old website's `--bs-primary`. The `brand-50` to `brand-900` ramp supplies
lighter surfaces and deeper shades. Yellow actions use dark text; small yellow
text uses the darker `primary-text` token for contrast in light mode.

The palette is Plum in both appearances. Palette primitives (`plum-50` through
`plum-900`, `reading-white`, and `amber-surface`) are private inputs to semantic
tokens, not component utilities. Each semantic token defines its light and dark
values together with `light-dark()`, keeping the two appearances in one place.

| Role              | Light   | Dark    |
| ----------------- | ------- | ------- |
| Background        | #FCF8FC | #211A24 |
| Card / popover    | #FFFFFF | #302735 |
| Main text         | #302735 | #F8F0E7 |
| Secondary surface | #F0E7F3 | #413348 |
| Secondary text    | #736377 | #C5B5C6 |
| Hover / selection | #F0E7F3 | #483524 |
| Decorative border | #DED2E2 | #57465E |
| Control boundary  | #736377 | #9E8AA6 |
| Primary action    | #F1A60A | #F1A60A |
| Text on primary   | #302735 | #302735 |
| Primary hover     | #FABD31 | #FABD31 |
| Highlighted text  | #804811 | #FFD065 |

The light header retains the brand yellow; its dark counterpart uses the card
surface. Header controls and their hover/border states have semantic tokens too.
The newsletter uses deep Plum in light mode and the card surface in dark mode,
with ivory text in both. Status colours keep their distinct meanings rather than
being recoloured purple.

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

Use `border` for decorative dividers and `input` for visible control boundaries.
Use `ring` for keyboard focus. Keep literal colours and palette primitives out of
components; use semantic Tailwind utilities or `var(--token)` in project CSS.
When adding a surface, choose its foreground pairing and cover its interactive
states. The browser theme tests check rendered text pairings at 4.5:1 and control
boundaries/focus at 3:1 in both themes, alongside axe checks and locale behaviour.

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
