# Line Break identity

The identity contains two marks: the full written logo and the favicon.
Both retain a yellow indentation beside the offset middle line.

## Files

- `logo.svg`: transparent wordmark with vector lettering and no font dependency.
- `logo.png`: transparent wordmark, 1200 pixels wide.
- `favicon.svg`: compact stanza mark on a pale tile for browser tabs.
- `favicon.ico`: 16, 32 and 48 pixel browser fallback.

## Usage

The header and footer render the full wordmark through `BrandLogo.astro`, using
semantic theme colours for the lettering and a constant yellow indentation. The logo
changes instantly with the theme, and its header size shrinks during scrolling.
The document head uses the SVG favicon and ICO fallback.

Preserve the offset line, proportions and gaps. Keep both marks upright in LTR
and RTL layouts; do not mirror them. Give the artwork clear space of at least
one bar thickness.

Saved artwork uses ink `#101010` and yellow `#F1A60A`; the favicon tile uses white `#FDFDFC`.
