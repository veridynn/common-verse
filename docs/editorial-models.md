# Editorial models

Model editor meaning rather than anticipated layouts. Prefer a few intentional
blocks over unrestricted visual configuration. Add a field only when editors can
understand when to use it and the frontend has a clear rendering contract.

Poems preserve one original title, language, and text, plus zero or more explicit
translation records, each with language, title, text, and translator attribution.
Never require one translation per site locale or hide the original based on the
UI locale. Keep shared facts such as dates, media relationships, and IDs
unlocalized. Localize editorial prose and editor-authored link labels where
independent translations make sense. Field labels and other editor controls are
UI, not editorial content.

Poems require an Author relationship when published; drafts may omit it. Authors
are shared writer profiles, independent of CMS user accounts. Their related poems
are shown through Payload’s native join field in the admin. Fixed shared pages do
not need a byline; events describe activities rather than authored texts.

Keep Payload’s native dashboard and cards. Organize the editorial sidebar as
Content (Articles, Events, Locations), Media (Images & Files), Administration (Users),
then Pages (Home, About, Contact, Privacy, Legal Notice). Collection IDs, route identities and labels use the same editorial names, including `locations`.

Home, About, Contact, Privacy, and Legal Notice are fixed Payload globals. Event,
poet, and poem detail pages come from their collections. Articles are an MVP collection with localized native rich text, drafts, preview
and public article routes. Do not add arbitrary pages. The legacy `pages` collection remains
hidden to preserve existing records and is not used by public routing or bulk seeding.

Poems and Authors are hidden from admin navigation until v2.0; preserve their
records and existing public routes.
See [accounts and permissions](accounts-and-permissions.md) for content access
and the planned contributor workflow.

The event editor currently shows a title, required description text field, required registration link, required image upload,
native date/time picker, required map-based location picker, and a required Lexical rich text content editor at the bottom during redesign.
Other event fields and their stored values remain in the model but are hidden
from the form. New events can be saved as drafts; publishing still requires a date.

Events offer Workshop (`workshop`) and Reading (`event`). Titles and descriptions
have no character limit or custom character counter. Content appears at the bottom of the form with headings, lists, quotes, alignment,
indentation, emphasis, links, separators, and images from Media. Images can be
selected from the library or uploaded within the editor; their alternative text
and credits appear on the public page. Articles retain their simpler toolbar.
Slugs generate from the title when missing and remain stable thereafter.
The editor shows one date/time (`startDate`); historical end dates remain stored
and continue to support upcoming-event filtering. Optional EUR prices (0 for free,
blank for unknown) belong only to readings. The Location field stores one structured location value. A single autocomplete searches
saved locations by alias and address, followed by external
map results. Selecting a result fills the search control with its full address
and the matching saved location's alias, when present.
Saved and external matches at the same coordinates are shown once. Focus and clicks
open the suggestions, including before typing. Clearing also shows saved bookmarks.

The shared `Location` component provides a Payload search input with a
bookmark button in a reserved leading slot and a Leaflet map underneath. Direct Photon requests
support autocomplete after three characters and reverse lookup; no geocoder plugin
is used. Saved suggestions use a bookmark icon and a bold alias
followed by the address on one line. Clear removes the selection and map pin.
Editors can also click the map, drag the pin, or search latitude/longitude pairs.
Reverse lookup fills the address without moving the chosen coordinates. When it
fails, coordinates remain usable and the picker shows an error.

In event forms, the search field contains a leading bookmark button. A bookmark-plus
opens Payload's native Create Location drawer, with the selected address and
coordinates prefilled. A filled bookmark opens the existing Location for editing.
The drawer uses the same form as the Locations page: an optional native Alias field
above the required Location search and map. There is no inline alias editor or
automatic bookmark creation. Saving creates or updates the Location, selects its
saved address/coordinates in the event, and closes the drawer. Cancelling leaves
the event selection unchanged. Saving a Location does not publish the event; its normal draft autosave continues.

Locations store three fields: optional `alias`, optional `address`, and required
`coordinates` as Payload's native Point in longitude/latitude order. The Location
control automatically writes the point from an address result, pasted coordinates,
map click, or marker drag. There are no duplicate coordinate fields or a nested
location group in the saved Locations collection, so the creation form has no group
separator. Its search only queries the geocoder; saved bookmarks appear only in
the event selector. Coordinate-only locations are valid.

Search results are cached in IndexedDB in the editor's browser, scoped to the
signed-in user and content language. Up to 100 query responses are retained for
one day; up to 50 selected places retain frequency and recency for 90 days.
Only selection increments usage, and bookmark aliases/IDs are not cached.
Unavailable browser storage falls back to normal search without blocking editing.
On empty event search focus, at most five bookmarks/recent selections appear.
While typing, at most two strongly matching familiar places precede up to six
provider results. Text relevance comes before bookmark status, frequency and
recency; weak substring matches are not promoted. Provider order is preserved,
duplicate points appear once, and provider matches of saved Locations retain
their bookmark icon even outside the two promoted positions. Cached results appear
immediately, with Photon refreshing after three characters and a 200ms debounce.
Location creation uses cached address results but never bookmark/history promotions.

The native Location drawer has a responsive maximum width of 42rem. It uses the
same fields as the Locations page, and its save action returns to the event form.

Events keep their own location snapshots, so later bookmark edits do not automatically change other events. The same structured value is used by the field, collection, search, and public website. The development experiment has been removed.

## Naming contracts

Use Articles (`Article`, `Articles`, `getArticle`, `getArticles`), Events
(`Event`, `Events`, `getEvent`, `getEvents`), Authors, Poems, Media, Users and fixed
Pages in application code and editor labels. Workshops are an event subtype;
poets are authors with published poems, not a separate account or collection.
Homepage author sections and relationship fields use `authors` too.

Collection slugs and block identifiers are stable data contracts. Public path
segments belong to [routing](routing.md), not UI translations. Historical
migrations retain the names of the schema they originally created.
