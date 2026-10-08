# Colour and appearance

Theme tokens live in `apps/web/src/styles/token.css`, imported by the global CSS
entry point configured in `apps/web/components.json`. Layout and component rules
stay in `global.css`. The token file owns Tailwind mappings, colour generation,
geometry tokens, shadows, and `color-scheme` selection.

## Editable inputs

Only these HEX inputs define the palette:

| Input   | Value   | Purpose                           |
| ------- | ------- | --------------------------------- |
| `black` | #101012 | Near-black anchor                 |
| `white` | #FDFDFC | Near-white anchor                 |
| `gold`  | #F1A60A | Original site brand yellow        |
| `plum`  | #736377 | Secondary colour and neutral tint |
| `green` | #176848 | Success                           |
| `red`   | #B42318 | Error                             |
| `blue`  | #215F93 | Information                       |

`primary-base`, `secondary-base`, `success-base`, `error-base`, and `info-base`
convert the corresponding HEX input automatically with `oklch(from … l c h)`.
Warning derives from gold. There is no conversion script or separate numeric
OKLCH value to maintain.

The `brand-50`–`brand-900` and `plum-50`–`plum-900` ramps mix each base towards
white or black in OKLCH. The 500 step retains the exact input. These ramps are
palette primitives; components should use semantic roles instead.

## Surfaces and elevation

The light page mixes 97% white with 3% Plum. The dark page mixes 88% black with
12% Plum. These percentages describe OKLCH interpolation weights, not alpha.
Gold stays concentrated in actions, the light header, and meaningful highlights.

| Surface                  | Light                                 | Dark                                                 |
| ------------------------ | ------------------------------------- | ---------------------------------------------------- |
| Page                     | Opaque, almost white with a Plum tint | Opaque near-black with a Plum tint                   |
| Card                     | Opaque white, small shadow            | Pale Plum-tinted background at 5% alpha              |
| Secondary / raised state | Pale Plum surface                     | Same pale tint at 8% alpha                           |
| Menu / popover           | Opaque white, floating shadow         | Opaque composite of 12% pale tint over the dark page |

Dark card backgrounds use alpha, not element opacity. Nested cards therefore
accumulate light while text stays opaque. Text pairings are verified against up
to three nested card layers; arbitrary nesting or placing these overlays on
photographs requires its own checks. Floating menus use an opaque composite
because portalled content cannot rely on a parent surface, and underlying text
must not bleed through. The opaque menu mix uses sRGB to match alpha compositing.

Light hierarchy uses three shadow tokens: `shadow-card` (2px offset / 6px blur),
`shadow-raised` (6px / 20px), and `shadow-floating` (12px / 36px). All use the black
anchor at 8% alpha in light mode and a transparent shadow colour in dark mode.
Card shadows apply consistently to editorial, event, and participation panels.

## Semantic roles

| Role                 | Tokens                                                                       |
| -------------------- | ---------------------------------------------------------------------------- |
| Page and text        | `background`, `foreground`                                                   |
| Cards and menus      | `card`, `card-foreground`, `popover`, `popover-foreground`                   |
| Main action          | `primary`, `primary-foreground`, `primary-hover`, `primary-text`             |
| Supporting surfaces  | `secondary`, `muted`, `accent`, each with `-foreground`                      |
| Boundaries and focus | `border`, `input`, `ring`                                                    |
| Feedback             | `success`, `warning`, `error`, `info`, each with `-foreground` and `-subtle` |

Text derives from the neutral anchors: main light text mixes black with 8% Plum,
and main dark text mixes white with 4% gold. Secondary text mixes towards the
page surface. Status text uses controlled lightness (42% light / 80% dark) and
capped chroma, with subtle fills mixed into the active page background. A fixed
OKLCH lightness difference does not guarantee a WCAG contrast ratio.

Use semantic Tailwind utilities such as `bg-primary text-primary-foreground`,
or semantic variables in project CSS. `destructive` aliases error. Compatibility
aliases `paper`, `ink`, `soft`, and `white` map existing editorial layouts onto the
same system. The Tailwind `white` compatibility alias represents the card surface;
the raw `--white` input represents the neutral anchor.

Use `border` for decorative dividers and `input` for control boundaries. Use
`ring` for keyboard focus. Do not communicate status through colour alone; add
clear text or an icon with a label. Keep literal colours out of components.

## Preferences and verification

Light, Dark, and System use the same semantic tokens through `light-dark()` and
`color-scheme`. System follows the device preference even without JavaScript.
Explicit choices are saved in the first-party `poetry-theme` cookie for one year,
shared across locale routes and applied during server rendering to prevent a
wrong-theme flash. Pickers use project-owned shadcn-svelte Popover / Bits UI.

The system requires support for relative OKLCH, `color-mix()`, and `light-dark()`.
After changing an input or formula, rerun theme browser tests: generated colours
do not automatically guarantee contrast. Tests sample composited sRGB pixels,
verify text at 4.5:1 and control/focus pairings at 3:1, check three nested alpha
card layers, and verify shade propagation from a changed HEX input. German and
Arabic checks cover saved preferences, system changes, keyboard opening/focus
return, 320px layouts, no-JavaScript rendering, and light/dark axe scans.
These checks cover the prototype, not a complete WCAG conformance audit.
