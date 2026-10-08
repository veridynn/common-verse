# Colour and appearance

Theme tokens live in `apps/web/src/styles/token.css`, imported by the global CSS
entry point configured in `apps/web/components.json`. Layout and component rules
stay in `global.css`. The token file owns Tailwind mappings, colour generation,
geometry tokens, shadows, and `color-scheme` selection.

## Editable inputs

Only these HEX inputs define the palette:

| Input   | Value   | Purpose                                 |
| ------- | ------- | --------------------------------------- |
| `black` | #101010 | Neutral near-black anchor               |
| `white` | #FDFDFC | Near-white anchor                       |
| `gold`  | #F1A60A | Original site brand yellow              |
| `slate` | #26465A | Restrained slate-blue secondary accents |
| `green` | #176848 | Success                                 |
| `red`   | #B42318 | Error                                   |
| `blue`  | #215F93 | Information                             |

`primary-base`, `secondary-base`, `success-base`, `error-base`, and `info-base`
convert the corresponding HEX input automatically with `oklch(from … l c h)`.
Warning derives from gold. There is no conversion script or separate numeric
OKLCH value to maintain.

The `brand-50`–`brand-900` and `slate-50`–`slate-900` ramps mix each base towards
white or black in OKLCH. The 500 step retains the exact input. These ramps are
palette primitives; components should use semantic roles instead.

## Surfaces and elevation

Light cards, menus, and the header mix 97% white with 3% gold for a faint warm
tint. The page mixes this neutral with 2% black, giving cards a quiet paper-like
backdrop. The dark page mixes 99% neutral black with 1% gold. Dark elevation
overlays mix 99% white with 1% gold before applying alpha. Secondary blue does not tint
general surfaces or neutral text: both themes keep the same warm gold character.
These percentages describe OKLCH interpolation weights, not alpha. Gold stays
concentrated in primary actions and meaningful highlights. The header is opaque
and warm near-white in light mode; dark mode uses an opaque composite of 5% pale tint
over the dark page. Header hover states and general accent surfaces mix 20% gold
with the warm light surface. The newsletter card uses this light primary tint
with the matching accent foreground. Dark accent surfaces use gold at 12% alpha.

| Surface              | Light                              | Dark                                                 |
| -------------------- | ---------------------------------- | ---------------------------------------------------- |
| Page                 | Opaque paper neutral               | Opaque near-black with a gold tint                   |
| Card                 | Opaque warm white, small shadow    | Pale gold-tinted background at 5% alpha              |
| Secondary controls   | Pale slate-blue surface            | Pale slate-blue tint at 12% alpha                    |
| Muted / raised state | Warm neutral surface               | Pale gold-tinted background at 8% alpha              |
| Menu / popover       | Opaque warm white, floating shadow | Opaque composite of 12% pale tint over the dark page |

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

Text derives from the neutral anchors: main light text mixes black with 4% gold,
and main dark text mixes white with 4% gold. Secondary text mixes towards the
page surface. Status text uses controlled lightness (42% light / 80% dark) and
capped chroma, with subtle fills mixed into the active page background. A fixed
OKLCH lightness difference does not guarantee a WCAG contrast ratio.

Primary backgrounds retain the vibrant gold input with near-black labels.
Primary text uses the same gold in both themes, with no outlines or halos.
Its contrast on light surfaces is unresolved and intentionally deferred;
existing contrast checks remain unchanged. The logo indent stays the original gold.

Use semantic Tailwind utilities such as `bg-primary text-primary-foreground`,
or semantic variables in project CSS. `destructive` aliases error. Compatibility
aliases `paper`, `ink`, `soft`, and `white` map existing editorial layouts onto the
same system. The Tailwind `white` compatibility alias represents the card surface;
the raw `--white` input represents the neutral anchor.

`secondary-text` uses the slate-blue base in light mode and raises its OKLCH
lightness to 80% in dark mode while preserving chroma and hue. Supporting links
and editorial notes use this role; secondary controls use blue-tinted fills
with matching text. Muted surfaces remain neutral so blue never becomes the
general page background.

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
verify text pairings at 4.5:1 and control/focus pairings at 3:1, check three nested alpha
card layers, and verify shade propagation from a changed HEX input. German and
Arabic checks cover saved preferences, system changes, keyboard opening/focus
return, 320px layouts, no-JavaScript rendering, and light/dark axe scans.
These checks cover the prototype, not a complete WCAG conformance audit.
