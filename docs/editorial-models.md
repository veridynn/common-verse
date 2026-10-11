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
Content (Articles, Events), Media (Images & Files), Administration (Users),
then Pages (Home, About, Contact, Privacy, Legal Notice). Collection IDs, route identities and labels use the same editorial names.

Home, About, Contact, Privacy, and Legal Notice are fixed Payload globals. Event,
poet, and poem detail pages come from their collections. Articles are an MVP collection with localized native rich text, drafts, preview
and public article routes. Do not add arbitrary pages. The legacy `pages` collection remains
hidden to preserve existing records and is not used by public routing or bulk seeding.

Poems and Authors are hidden from admin navigation until v2.0; preserve their
records and existing public routes.
See [accounts and permissions](accounts-and-permissions.md) for content access
and the planned contributor workflow.

## Naming contracts

Use Articles (`Article`, `Articles`, `getArticle`, `getArticles`), Events
(`Event`, `Events`, `getEvent`, `getEvents`), Authors, Poems, Media, Users and fixed
Pages in application code and editor labels. Workshops are an event subtype;
poets are authors with published poems, not a separate account or collection.
Homepage author sections and relationship fields use `authors` too.

Collection slugs and block identifiers are stable data contracts. Public path
segments belong to [routing](routing.md), not UI translations. Historical
migrations retain the names of the schema they originally created.
