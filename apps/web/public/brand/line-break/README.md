# Line Break identity

The full logo sets the name in three lines with an offset middle line and an
amber margin rule. The mini mark abstracts that layout into three solid bars.
Its detached middle block retains the margin accent even in one colour.

## Files

- `logo.svg`: primary transparent wordmark with outlined lettering; no font dependency.
- `logo-reversed.svg`: pale lettering and amber accent for dark backgrounds.
- `logo-monochrome.svg`: single-colour wordmark.
- `logo.png`: transparent wordmark, 1200 pixels wide.
- `icon.svg`: transparent compact mark.
- `icon-reversed.svg`: compact mark for dark backgrounds.
- `icon-monochrome.svg`: single-colour compact mark.
- `icon.png`: transparent compact mark, 512 pixels square.
- `icon-tile.svg`: plum compact mark on an amber tile.
- `favicon.svg`: compact mark on a pale tile for browser tabs.
- `favicon.ico`: 16, 32 and 48 pixel browser fallback.
- `icon-16.png`, `icon-32.png`, `icon-48.png`: pale favicon tiles.
- `icon-180.png`, `icon-192.png`, `icon-512.png`: amber tiles for touch icons and avatars.

## Usage

Use the wordmark where the name can be read comfortably. The header uses a
compact wordmark that shrinks as the page scrolls. Use the abstract mark for
browser tabs, avatars and smaller placements. Preserve the offset line,
proportions and gaps.
Keep the mark upright in both LTR and RTL layouts; do not mirror it.

Plum: `#302735`. Amber: `#F1A60A`. Pale: `#FCF8FC`.
Use the reversed artwork on dark surfaces and the monochrome artwork on amber.
Give the artwork clear space of at least one bar thickness.

The site header and footer render the wordmark with semantic theme colours through
`BrandLogo.astro`. The document head uses the SVG favicon, ICO fallback and
180-pixel touch icon.
