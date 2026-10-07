# Accessible UI library comparison for The Poetry Project

Research date: 8 October 2026.

Status: research and recommendation, not an approved architecture change.

The recommended approach is to retain Astro and Svelte, use native HTML wherever
it fits, and keep Bits UI with selectively styled shadcn-svelte components. The
strongest alternatives worth evaluating are Ark UI for Svelte and Starwind for
Astro. Accessible Astro is also relevant for a predominantly editorial site.

This comparison draws on the original client brief, current repository
requirements, and official library documentation and release information. It
does not include hands-on assistive-technology testing or bundle benchmarks.
Library capabilities and maturity statements describe the sources reviewed on
the research date and should be rechecked before adoption.

## Client and selection criteria

The client is The Poetry Project, a nonprofit integration-focused poetry
initiative. The brief calls for six languages, Arabic and Persian RTL,
accessible poetry and workshop content, nontechnical editors, and eventually a
small bookshop. Ecommerce remains deferred under current project guidance.

| Priority                    | What it means for the choice                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| Accessibility               | Reliable keyboard interaction, focus management, screen-reader semantics, and understandable errors.  |
| Multilingual behavior       | Translated interface labels, RTL interactions, and mixed-direction poetry within a page.              |
| Readability and performance | Poems and workshop information available as server-rendered HTML, with little unnecessary JavaScript. |
| Design freedom              | A distinctive cultural and editorial identity with appropriate typography for every script.           |
| Maintenance                 | A small, coherent component system that another developer can maintain affordably.                    |
| Future interaction          | Enough capability for search, filters, registration forms, and later a cart.                          |

Supported locales are German, English, Arabic, Persian, Ukrainian, and Kurmanji.
Arabic and Persian are RTL; Kurmanji is LTR. Originals and translations may have
different languages and directions from the surrounding interface. Missing
editorial translations must not silently appear as translated content.

The [project guidance](project-guidance.md) already selects shadcn-svelte and
Bits UI. Alternatives below are candidates for reconsideration, not additions to
install alongside the current general-purpose system without a demonstrated need.
Astro continues to own routing, rendering, and SEO; Svelte owns reusable UI and
interactive islands; Payload owns editorial workflows.

## Comparison

Headless means the library supplies interaction behavior while the project
supplies the appearance. It does not mean zero JavaScript or automatic
accessibility. The assessments below are judgments about this project, not
measured accessibility rankings.

| Approach or library                | Headless                                                  | Astro integration                             | Main benefit                                                        | Main concern                                                    | Assessment                                       |
| ---------------------------------- | --------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------ |
| Native HTML and project components | No imposed styling                                        | Direct HTML or unhydrated Svelte components   | Simple, fast, dependable basic controls                             | Project owns custom interaction behavior                        | Foundation for every option                      |
| Bits UI and shadcn-svelte          | Bits is headless; shadcn supplies styled, editable source | Svelte components and interactive islands     | Strong behavior foundation with full visual control                 | Customization and updates need review                           | Best overall fit                                 |
| Ark UI for Svelte                  | Yes                                                       | Svelte islands                                | Broad primitives, explicit locale support, state-machine foundation | Migration work and another component API                        | Strongest headless alternative                   |
| Starwind UI and primitives         | Styled and headless options                               | Native Astro adapters; Svelte adapter in beta | Astro integration, editable source, shared behavior runtime         | Svelte maturity and RTL evidence need scrutiny                  | Strongest Astro-native challenger                |
| Accessible Astro Components        | Customizable styled components                            | Native Astro components and scripts           | Accessibility-focused editorial building blocks                     | Less suitable as the sole foundation for richer Svelte features | Good editorial alternative                       |
| Skeleton                           | Styled design system                                      | Documented Astro and Svelte integration       | Coherent themes and Zag-based interactions                          | Replaces much of the existing styling system                    | Viable, lower priority                           |
| Melt UI                            | Headless builders                                         | Inside Svelte islands                         | Detailed control over markup                                        | More implementation work; multiple API generations              | Specialist option                                |
| Web Awesome                        | Styled web components                                     | Astro integration; experimental SSR           | Framework independence and documented AT testing                    | JavaScript dependence, Shadow DOM, extra localization layer     | Conditional option                               |
| daisyUI                            | CSS components                                            | Styles ordinary HTML                          | Quick styling and RTL layout support                                | CSS does not supply a complete accessible interaction contract  | Styling option, not the accessibility foundation |
| Flowbite Svelte                    | Styled components                                         | Through Svelte integration                    | Broad ready-made component selection                                | No clear project-specific advantage over the current stack      | Lower priority                                   |

## Bits UI and shadcn-svelte

Bits UI documents keyboard navigation, focus management, screen-reader support,
and unstyled composition. Its dialog documentation explains focus trapping,
initial focus, focus restoration, dismissal, and nested dialogs. These are the
behaviors needed for search dialogs and a future cart drawer.
[Bits introduction](https://www.bits-ui.com/docs/introduction),
[dialog documentation](https://www.bits-ui.com/docs/components/dialog).

shadcn-svelte supplies editable Svelte source built around Bits UI and Tailwind.
The visual layer can be adapted to the client while underlying behavior fixes
arrive through dependencies. Modifications to copied project components remain
the project's responsibility.
[shadcn-svelte documentation](https://shadcn-svelte.com/docs).

This approach preserves the current architecture, supports sophisticated Svelte
interactions, and permits an editorial visual identity. Default shadcn styling
is a starting point: typography, spacing, imagery, and component styling should
be designed for the poetry project.

RTL configuration is component-specific. For example, Bits' slider exposes a
direction setting that defaults to LTR. Relevant controls must use central locale
metadata, with actual keyboard behavior verified in RTL.
[Slider RTL documentation](https://www.bits-ui.com/docs/components/slider).

Recommendation: retain this approach unless a focused prototype demonstrates a
concrete deficiency.

## Ark UI for Svelte

Ark officially supports Svelte alongside React, Solid, and Vue. It is
MIT-licensed and built on Zag's state machines by the Chakra UI team. It is a
candidate for the current stack without introducing React.
[Ark overview](https://ark-ui.com/docs/overview/about).

Its documentation covers initial and final dialog focus and a locale provider
for locale and direction. The provider defaults to `en-US` and LTR when omitted,
so locale configuration must be deliberate inside islands.
[Dialog behavior](https://ark-ui.com/docs/components/dialog),
[locale provider](https://ark-ui.com/docs/utilities/locale).

Its strengths are broad interaction coverage, explicit internationalization
utilities, and a shared behavioral foundation across frameworks. Adoption would
require rebuilding component wrappers and styles and verifying Astro SSR
integration. Recent Svelte release notes include an SSR fix for navigation menus,
reinforcing the need to test the actual adapter and versions selected.
[Official releases](https://github.com/chakra-ui/ark/releases).

Recommendation: the strongest headless alternative to compare against Bits. Use
Ark before working directly with Zag unless unusually custom behavior calls for
lower-level state machines.

## Starwind

Starwind has three layers: editable styled components, headless primitive
adapters, and a framework-independent DOM runtime. Its Astro adapter is documented
as stable. Its repository identifies the Svelte 5 adapter as beta with potentially
changing APIs.
[Architecture documentation](https://starwind.dev/docs/getting-started/),
[Svelte adapter status and MIT license](https://github.com/starwind-ui/starwind-ui/blob/main/README.md).

Its dialog primitive uses native dialog anatomy with runtime-managed focus,
dismissal, scroll locking, and nested-dialog coordination.
[Dialog primitive](https://starwind.dev/docs/primitives/dialog/).

Starwind could support more UI composed directly in Astro while retaining
editable source and accessible interaction primitives. Adopting Astro primitives
alongside existing Svelte components introduces another behavior system. Runtime
initialization and cleanup need verification around navigation, repeated mounts,
and future cart state.
[Runtime lifecycle](https://starwind.dev/docs/runtime/).

Component-level RTL documentation exists, but the reviewed sources do not
establish every complex widget's RTL behavior. That remains a prototype gate.

Recommendation: the strongest Astro-native challenger if reducing
framework-bound UI is an explicit goal. The beta Svelte adapter argues against a
wholesale replacement today.

## Accessible Astro Components

Accessible Astro focuses on semantic markup, keyboard interaction, logical CSS
properties, and screen-reader behavior. It includes skip links, breadcrumbs,
pagination, disclosures, tabs, and modals. Its modal uses native `<dialog>` and
documents focus return and reduced-motion support.
[Library overview](https://accessible-astro.incluud.dev/components/overview/),
[accessibility approach](https://accessible-astro.incluud.dev/getting-started/introduction/),
[modal behavior](https://accessible-astro.incluud.dev/components/modal/).

Much of the public site involves reading, browsing, and finding workshop
information. These needs do not require a large application component system.
However, adopting this library alongside Svelte would create a second reusable
UI implementation unless component ownership changed intentionally. Mixed-language
pages, RTL keyboard interactions, and customized styles still need verification.

Recommendation: a good alternative for an Astro-led editorial implementation,
and a useful reference even if Bits remains the foundation.

## Skeleton and Melt UI

Skeleton offers a themed design system and Svelte components built on Zag. It
documents native-first principles and Astro integration, including Svelte wrappers
in some cases.
[Skeleton architecture](https://www.skeleton.dev/docs/svelte/get-started/introduction),
[Astro integration](https://www.skeleton.dev/docs/svelte/get-started/installation/astro).

It could accelerate a coherent themed interface. The concern is styling and
component migration when the current system already provides the essential
capabilities. Consider it if the team prefers its design-system conventions.

Melt UI offers unstyled builders that attach behavior to project markup, with
documented ARIA, keyboard, focus, and SSR considerations. Its original
documentation warns about pre-1.0 changes and directs users to a newer
runes-based generation.
[Melt documentation](https://melt-ui.com/docs/introduction),
[next-generation repository](https://github.com/melt-ui/next-gen).

Melt provides substantial control but gives the project more assembly
responsibility. Consider it for a specific requirement Bits cannot satisfy,
rather than as another general-purpose layer.

## Web Awesome and Shoelace

Web Awesome documents testing with NVDA in Chrome and Firefox and VoiceOver in
Safari. It provides an Astro integration, but its team describes SSR as
experimental and emphasizes that SSR does not make components function without
JavaScript.
[Testing and SSR limitations](https://webawesome.com/support),
[Astro integration](https://webawesome.com/docs/frameworks/astro).

Its component-internal translations introduce another localization mechanism.
Per-component language and direction overrides have specific rules, and missing
translations fall back to English. Adoption would require reconciling this with
Paraglide, particularly for Kurmanji.
[Localization documentation](https://webawesome.com/docs/localization).

Recommendation: attractive for a design system shared across several frameworks.
That benefit is less valuable for this single Astro and Svelte public frontend.

Shoelace should not be shortlisted independently. Its official site states that
it is sunset with no active development and directs users to Web Awesome.
[Shoelace status](https://shoelace.style/).

## daisyUI and Flowbite Svelte

daisyUI supports RTL through logical CSS properties. Chosen markup and behavior
still matter: its modal documentation distinguishes native dialog from legacy
checkbox and anchor methods, which lack Escape dismissal and background
interaction locking.
[RTL information](https://daisyui.com/docs/roadmap/),
[modal methods](https://daisyui.com/components/modal/).

Flowbite Svelte documents accessibility behavior on individual components,
including buttons and accordions. It is a plausible styled library, but there is
no demonstrated project-specific reason to migrate from the current customizable
primitives.
[Buttons](https://flowbite-svelte.com/docs/components/buttons),
[accordions](https://flowbite-svelte.com/docs/components/accordion).

Recommendation: neither is the first choice when accessibility behavior and a
distinctive multilingual identity carry the most weight.

## Feature implementation approach

| Feature                                     | Preferred approach                                                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Poems, author biographies, workshop details | Server-rendered content with explicit language and direction and preserved poem formatting. |
| Site navigation                             | Ordinary links with a disclosure for mobile navigation or subnavigation.                    |
| Language switching                          | Clearly named language links or a native control where suitable.                            |
| Workshop filters                            | Native form controls first; enhanced Svelte interaction when useful.                        |
| Search suggestions                          | A headless combobox only when autocomplete is needed.                                       |
| Registration forms                          | Native inputs, visible labels, translated errors, and server-side validation.               |
| Future cart                                 | Svelte state with a tested dialog or drawer primitive.                                      |

Ordinary website navigation generally does not need ARIA application-menu
behavior. W3C demonstrates disclosure navigation for this use case. Astro can
render framework components as HTML without hydration, adding client JavaScript
only when needed.
[W3C navigation guidance](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/),
[Astro rendering and hydration](https://docs.astro.build/en/guides/framework-components/).

## Shortlist and decision gates

1. Native HTML, Bits UI, and customized shadcn-svelte: recommended baseline.
2. Native HTML and Ark UI for Svelte: strongest headless alternative.
3. Starwind's Astro primitives and styled source: strongest Astro-native alternative.
4. Accessible Astro: editorial-focused alternative if interaction scope is simplified.

Before replacing the current foundation, compare the approaches through the same
small prototype: mobile navigation, language switching, a search dialog, and a
form with recoverable errors. Use German and Arabic, plus a Persian poem embedded
in a German page. Verify:

- Keyboard operation and focus restoration.
- Screen-reader announcements and accessible names.
- RTL interaction behavior and mixed-direction content.
- Zoom, reflow, visible focus, contrast, and reduced motion.
- Server-rendered content and useful behavior before hydration.
- JavaScript cost and integration effort.
- Translation of visible labels, errors, and component-generated messages.
- Ownership and update costs of customized component source.

Accessibility failures in critical tasks should disqualify an implementation
until resolved; styling convenience should not compensate for those failures.
Choose a replacement only if it demonstrates a concrete benefit sufficient to
justify migration and maintenance costs.

No library's accessibility label establishes WCAG conformance for the finished
site. The target is a scoped WCAG 2.2 AA implementation with automated and manual
verification. This research does not establish a conformance verdict for any
library or the current application.
[WCAG 2.2](https://www.w3.org/TR/WCAG22/).
