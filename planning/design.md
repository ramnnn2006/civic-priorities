# Frontend and hero preparation

Verified 2026-09-11. Planning only: no app scaffold, package installation, or global configuration changes. Full problem statements are absent from the supplied brief; keep domain choice provisional and reconcile with the architecture/research workers.

## Proposed framework and visual direction

Use **React + TypeScript + Vite**, Tailwind and shadcn-compatible components. The fetched shortlist contains React TSX and `@/` imports; configure that alias, Tailwind, shadcn `components.json`, and `cn` before eventual component installation. This is a proposed architecture agreement, not a claim another worker has approved it. Keep Google API credentials behind the backend. Next.js is unnecessary for this proposed demo unless the architecture owner requires its server features. Svelte would require replacing the React shortlist.

A content-led split hero: left, one concrete outcome and a primary **Try an example** CTA; right, an honest sample of the actual input → sourced result → next action flow. Show source name/date and distinguish sample data from live results. Below it, three compact feature cards explain input, evidence, and action. Country/language selectors should change actual supported configuration; never imply country coverage from decorative globe markers.

Use warm off-white surfaces, dark slate text and a restrained teal primary accent. System sans initially; add tested script coverage for selected Indian languages later. Use 16px body text, generous line height, an approximately 60-character prose measure and a simple 8px spacing rhythm. Stack hero on phones; keep the CTA before decorative visuals. Typography and colors are proposals, with contrast to be measured during implementation.

| Final domain | Adapt hero preview and CTA |
|---|---|
| Civic feedback | A sample report → category/location → responsible service; “Try a sample report” |
| Air | A selected station/time → sourced reading and trend; “Explore a station” |
| Agriculture | Crop/location/question → sourced advisory with limitations; “Try a crop question” |
| PHC supply chain | Facility/item → stock or shipment evidence → suggested operational action; “Inspect a sample facility” |

## Verified component shortlist

All four URLs below returned HTTP 200 and parsed as actual registry JSON. Embedded TSX imports and declared dependencies were inspected. **Commands are URL-verified, not executed or build-tested**, honoring the no-install instruction. Evidence: [verification.json](design-evidence/verification.json) and the corresponding saved raw JSON files.

| Component | Exact proposed install command | React suitability and decision |
|---|---|---|
| Magic UI Bento Grid | `npx shadcn@latest add "https://magicui.design/r/bento-grid.json"` | React TSX, Radix icons, registry dependency `button`. Recommended base: three evidence/action cards. [Registry](https://magicui.design/r/bento-grid.json), [docs](https://magicui.design/docs/components/bento-grid). |
| Magic UI Blur Fade | `npx shadcn@latest add "https://magicui.design/r/blur-fade.json"` | React hooks + `motion/react`; declared package `motion`. Optional one-time reveal below the hero. Skip blur on text and never delay primary content. [Registry](https://magicui.design/r/blur-fade.json). |
| Magic UI Globe | `npx shadcn@latest add "https://magicui.design/r/globe.json"` | React effect/ref, COBE WebGL (`cobe@^0.6.4`) + `motion`. Optional portability illustration only; not a map/data visualization. Requires no R3F. [Registry](https://magicui.design/r/globe.json). |
| Skiper87, scroll/fade candidate | `npx shadcn@latest add "https://skiper-ui.com/registry/skiper87.json"` | React TSX; imports shadcn ScrollArea, registry dependency `scroll-area`, declares `framer-motion`. Reserve alternative to Blur Fade; inspect/adapt full demo markup before adopting. [Registry](https://skiper-ui.com/registry/skiper87.json), [catalog](https://skiper-ui.com/). |

Default selection is Bento Grid alone; add one restrained reveal if time permits. Avoid adding both `motion` and `framer-motion` through competing effects. Registry availability does not establish compatibility with the eventual lockfile or nested registry dependencies; those remain build-time checks. Before eventual package commands, retain all orchestrator-provided `/var/tmp/codex-community-ai` cache environment settings; no package commands were run here.

## Catalog and naming checks

- **Magic UI:** fetched official Bento documentation and all three component registry endpoints through Scrapling first. Markdown extraction escaped parts of JSON; a subsequent raw HTTP fetch confirmed valid JSON and preserved source payloads. The globe is COBE-based, so adding Three.js solely for it is unnecessary.
- **Skiper:** official homepage fetched successfully. `https://skiper-ui.com/registry/skiper87` returned 404, and `/registry.json` also returned 404. The corrected component path `/registry/skiper87.json` returned valid JSON. Do not copy the brief’s extensionless HTTP command. Raw fallback verification is recorded separately from the initial Scrapling attempt.
- **21st.dev:** browsed the catalog through the [BentoItem candidate](https://21st.dev/@dhileepkumargm/components/bento-item). Search discovery described a tilt/scale bento wrapper, but the directly fetched page returned HTTP 200 with **“Component Not Found”**. [Saved page](design-evidence/21st-bento.md). No verified install URL; excluded from shortlist. Do not mistake transport success for a working component. Other 21st components remain unverified.
- **Animaster:** the [exact npm registry endpoint](https://registry.npmjs.org/animaster) returned 404. [GitHub repository search](https://api.github.com/search/repositories?q=animaster&per_page=5) returned matches, including `kontur-web-courses/animaster` described as “animaster task,” last pushed 2024-05-01. Another name match was pushed in May 2026, so search results do **not** prove universal abandonment. This bounded check did not establish a maintained, published frontend library called Animaster; exclude pending an exact package/repository reference. [Saved metadata](design-evidence/animaster-search.json).
- **Three UI:** name is genuinely ambiguous. The [literal ThreeUI repository](https://github.com/poki-archive/three-ui), inspected via web discovery, is archived (May 26, 2021) and describes a canvas UI rendered within Three.js. It is not the intended DOM component stack. Interpret the brief as optional Three.js / React Three Fiber + drei, not authorization to install an arbitrary similarly named package. No 3D scene is presently required. If later justified by a real spatial interaction, use R3F + drei with React; Threlte belongs to a Svelte alternative and is outside this proposal. Version compatibility remains unverified because no 3D stack was selected.

## Accessibility and performance acceptance plan

- Keep headline, CTA, forms and evidence in semantic DOM. Keyboard access, visible focus, labels, 44px touch targets and text explanations for status colors. Aim for 4.5:1 body-text contrast; test actual tokens.
- With `prefers-reduced-motion: reduce`, render content immediately at full opacity, omit reveal wrappers and do not mount an animated canvas. CSS alone cannot stop JavaScript/WebGL loops. Provide an explicit pause option for persistent motion.
- Replace globe with a static SVG or a text list of supported countries on reduced motion, unavailable WebGL or low-performance devices. Never require dragging, hover or scroll animation to access information.
- Lazy-load optional canvas after useful content; pause/unmount offscreen and on hidden tabs, cap DPR around 1–1.5, and avoid particles, postprocessing and simultaneous visual loops. Dispose render resources on unmount.
- Use normal document scroll; no scroll hijacking or nested scroll container for the core flow. Loading, empty, timeout and retry states must preserve input. Announce result changes politely to screen readers.
- Implementation targets, not measured results: LCP ≤2.5s, CLS <0.1, and usable primary flow without optional animation. Check throttled loading, keyboard-only use, reduced motion, 360px viewport, WebGL failure and a live end-to-end run before the demo.

## Evidence and remaining limitations

Scrapling static CLI was the first fetch method; sandbox DNS failed, then an approved network escalation succeeded. Raw JSON checks used Python standard-library HTTP after Scrapling. No dependency installation was needed. Source snapshots are under `design-evidence/`; `verification.json` records raw endpoint results. Web search was used for discovery and the explicitly identified ThreeUI fallback; fetched registry/source content drives the shortlist.

The UI/UX skill’s accessibility/layout guidance was applied. Its prescribed design-system script is absent at `/home/sparxz/.codex/skills/ui-ux-pro-max/scripts/search.py`; no generated design system is claimed. Final PS wording, framework agreement, package-version compatibility, licenses for adopted source/assets, rendered component appearance, bundle measurements and the 21st install URL remain unresolved. These are explicit handoff items, not blockers to selecting the lightweight direction above.
