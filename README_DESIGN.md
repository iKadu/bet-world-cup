# Handoff: World Cup 2026 Predictor — Full UI Redesign

## Overview
A complete visual design for the WC26 Predictor web app — a single global competition where users predict scores for all 104 matches of the 2026 FIFA World Cup. Covers every screen (Dashboard, Matches, My Predictions, Leaderboard, Sign in/up, Admin Sync) in both **dark** (primary) and **light** themes. Aesthetic: **bold sports-broadcast scoreboard** — big condensed display type, monospace scores/stats, near-black surfaces, a single electric-lime accent.

> **Current direction = v2 (sidebar layout).** The app is built around a fixed **left sidebar** (grouped nav + search + theme/language/user in the footer) and a slim per-page **topbar**, replacing the original top-nav. Build from the **App Shell** + **v2** files. The original top-nav files are kept only as historical reference. The **Matches** page additionally has a **Round filter** (All / Group stage / Round of 32 → Final). Both themes are designed to parity (14 frames: 7 dark + 7 light).

## About the Design Files
The files in this bundle are **design references created in HTML** — a streaming prototype showing the intended look and behavior. They are **not production code to copy directly.** Your task is to **recreate these designs in the existing codebase** — Next.js 16 (App Router) + TypeScript, Tailwind v4 + shadcn/ui (base-ui primitives) — using its established component patterns, tokens, and conventions. Build real `shadcn/ui` components (Tabs, Table, Card, Badge, Button, Input, Avatar, DropdownMenu) themed to match the spec below; do not port the inline-styled HTML verbatim.

The HTML was authored as a "Design Component" (a single streaming file). Ignore the `<x-dc>`, `<helmet>`, and `support.js` scaffolding — that is the prototyping runtime, not part of the design. Only the markup, layout, colors, and type matter.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, and component states are all specified. Recreate the UI to match closely, substituting your design-system primitives. Exact hex values, font families, and sizes are given in **Design Tokens**.

---

## Design Tokens

### Typography
Three Google Fonts. Add to the app (next/font or `<link>`):
- **Saira Condensed** (400/500/600/700/800) — display: headings, team names, big titles. Always `text-transform: uppercase`, tight tracking.
- **Saira** (400/500/600/700) — UI & body: labels, paragraphs, nav, buttons-as-text.
- **JetBrains Mono** (400/500/700/800) — all numerics: scores, clocks, points, ranks, stats, eyebrow labels. Use tabular figures.

Suggested Tailwind theme mapping: `font-display: 'Saira Condensed'`, `font-sans: 'Saira'`, `font-mono: 'JetBrains Mono'`.

Type scale seen in the design (px): hero titles 56–76 (display, 800), screen titles 40 (display, 800), card big-stat numbers 38–64 (mono, 800), big scores 40–46 (mono, 800), section labels 13 (display, 800, tracking .16em, uppercase), eyebrow/labels 11–12 (mono, 700, tracking .12–.18em, uppercase), body 14 (Saira, 600), small meta 12–13.

### Colors — Dark theme (primary)
| Token | Hex | Use |
|---|---|---|
| `bg` | `#0a0d12` | app background, deepest surface |
| `surface` | `#14181f` | cards, input tiles |
| `surface-raised` | `#161b22` → `#10141a` (gradient) | stat cards |
| `surface-row` | `#12161d` / `#0e1218` | list rows |
| `header-bg` | linear-gradient(180deg, `#0e1319`, `#0a0d12`) | top nav bar |
| `border` | `rgba(255,255,255,.07)` (hairline), `.12`–`.18` (inputs) | |
| `text` | `#f2f4f7` | primary |
| `text-muted` | `#8b93a1` | secondary |
| `text-dim` | `#565e6b` | tertiary / disabled |
| `text-soft` | `#c8cdd6` | finished-match values |
| **`accent` (lime)** | **`#c2f23d`** | brand, CTAs, exact-score, rank highlight |
| `live` (red) | `#ff3b4e` (dot/fill), `#ff6675` (text) | LIVE status |
| `amber` | `#ffb02e` | 5-pt result, Postponed, Admin badge |

### Colors — Light theme
| Token | Hex |
|---|---|
| `bg` | `#f3f3f0` |
| `surface` (card) | `#ffffff` |
| `surface-soft` | `#faf9f6` / `#f7f7f4` |
| `border` | `rgba(0,0,0,.08)` |
| `text` | `#14181f` |
| `text-muted` | `#6b7280` |
| `text-dim` | `#9aa2b1` |
| `accent-text` (lime is too light on white) | `#4e7a00` |
| accent fills | lime `#c2f23d` on dark text, OR `#0a0d12` block w/ lime text |
| `live` | `#e0364c` |
| amber text | `#b06a00` |

> **Theme inversion rule:** in light mode the logo mark, primary buttons, and the leaderboard "leader" podium flip to **dark backgrounds with lime text/icon** (instead of lime backgrounds). Lime is never used as text on white — use `#4e7a00` for accent text.

### Points color language (used everywhere predictions are scored)
- **10 pts (exact score):** lime — dark `#c2f23d` on `rgba(194,242,61,.13)` border `rgba(194,242,61,.35)`; light `#3f7a00` on `rgba(120,180,20,.16)`.
- **5 pts (correct result):** amber — dark `#ffb02e` on `rgba(255,176,46,.12)`; light `#b06a00` on `rgba(255,176,46,.2)`.
- **0 pts (miss):** dim — `#565e6b` on `rgba(255,255,255,.04)`; light `#9aa2b1` on `rgba(0,0,0,.04)`.

### Status badge vocabulary (fixed set)
Small pill: `font-mono 700 10–11px`, `letter-spacing .08–.1em`, `uppercase`, `padding 5–6px 10–11px`, `border-radius 6px`.
- **Scheduled** — neutral: text `#9aa2b1`, bg `rgba(255,255,255,.05)`, border `rgba(255,255,255,.14)`.
- **Live** — red with a pulsing 6–7px dot: text `#ff6675`, bg `rgba(255,59,78,.16)`, border `rgba(255,59,78,.45)`. Dot `#ff3b4e` animates opacity/scale (see Interactions).
- **Finished** — solid neutral: text `#c8cdd6`, bg `rgba(255,255,255,.07)`, border `rgba(255,255,255,.16)`.
- **Postponed / Suspended / Cancelled** — amber: text `#ffb02e`, bg `rgba(255,176,46,.13)`, border `rgba(255,176,46,.4)`.

### Radii, shadows, spacing
- Radius: cards/frames `14–16px`, rows/inputs/tiles `9–12px`, badges `6–8px`, logo mark `7–8px`.
- Card shadow (frames): `0 30px 80px rgba(0,0,0,.4)` dark / `rgba(0,0,0,.12)` light. Leader podium glow (dark): `0 0 0 1px rgba(194,242,61,.1), 0 20px 50px rgba(194,242,61,.08)`.
- Page content padding: `40px` horizontal. Section gaps `26px`. Row gaps `10px`. Inner row padding `14–16px 20–22px`.
- Logo mark: 30px square, lime bg, dark `W` (mono 800), `transform: skewX(-7deg)` — the skew is a signature detail, keep it.

---

## Shared Component: App Shell (v2 — every page except auth)
A fixed left **sidebar** (252px) + a flexible **main column**. Auth screens (Sign in/up) skip the shell — they're a centered card on the app background.

**Sidebar** (`bg #0c0f15` dark / `#fff` light, right hairline border, `padding 22px 16px`, flex column):
- **Brand row:** logo mark (skewed lime square + `W`, `skewX(-7deg)`) + wordmark `WC26` (display 800, tracking .2em). On admin pages an amber **Admin** pill sits at the row's right.
- **Search:** a full-width 40px field (`surface` bg, hairline border, radius 11) — magnifier glyph + "Search teams, matches…" + a `⌘K` keyboard hint chip pinned right. Opens a command palette (your call).
- **Grouped nav:** mono uppercase section labels (`Menu`, `Compete`, and `Admin` for admins) over nav items. Each item: 15px icon glyph + label (Saira 600, 14px) + optional right-aligned mono count (Matches `104`, My Predictions `39`). Items: `padding 11px 12px`, radius 10, muted text. **Active item** = lime-tinted pill (`rgba(194,242,61,.12)` bg, `#c2f23d` text; light: `rgba(120,180,20,.12)` bg, `#3f7a00` text). Exactly one active per page. Nav: Home · Matches · My Predictions · Groups · Leaderboard · Bracket (+ Data Sync for admins).
- **Sidebar footer** (pinned bottom, `margin-top:auto`): a **"2 live now"** card (red-tinted, pulsing dot, names the live fixtures) → a 2-up control row: **Theme toggle** (☾/☀) and **Language selector** (🌐 + `EN`) as equal-width outlined buttons → a **user card** (gradient avatar `DH` + name + a mono `RANK #47 · 285 PTS` line + ▾). Signed-out: swap the user card for "Sign in" / "Sign up" buttons.

**Main column topbar** (`padding 18px 34px`, bottom hairline): left = a mono uppercase **breadcrumb/eyebrow** + the **page title** (display 800, 26px); right = page-specific actions or stats (e.g. Dashboard shows a "2 matches live" badge; My Predictions shows Points/Exact/Hit-rate; Admin shows the "↻ Trigger manual sync" button).

### Language selector (i18n)
Lives in the **sidebar footer** (v2) as a 🌐 + `EN` outlined button beside the theme toggle. Opens a menu: flag emoji + native name per language, active row lime-tinted with a ✓.
- **Languages shipped:** 🇬🇧 English · 🇪🇸 Español · 🇧🇷 Português · 🇫🇷 Français · 🇩🇪 Deutsch. (Adjust to your locale plan.)
- **Implementation:** wire to your i18n layer (e.g. `next-intl` / `next-i18next`) — selecting a language switches the locale and re-renders all UI strings. Persist the choice (cookie or `localStorage`) and reflect it in the URL/locale segment if you use locale-prefixed routes. **All user-facing copy** (nav, titles, labels, status badges, button text, eyebrows) comes from translation keys. Numerics, scores, team flags, and player names stay as-is; format dates/times per locale.

---

## Screens / Views

### 1. Home / Dashboard — `/`
**Purpose:** orient the user, show their standing, drive them to predict.
**Layout (top→bottom):** header → hero band → 2-col stat grid (1.3fr / 1fr) → "Predict next 5" list.
- **Hero band:** padding `40px`, subtle radial lime glow from top-left, bottom border. Eyebrow row: `FIFA WORLD CUP 2026 · Matchday 3 · Group stage` (mono, lime + muted, dot separators). Big title "Welcome back, Diego." (display 800, 56px, uppercase, two lines). Right side: a "2 matches live now" pill (red, pulsing dot). For signed-out users, replace the live pill / performance card with a sign-in prompt CTA.
- **Performance card:** label "Your performance". Left: rank `#47` (mono 800, 64px) with `▲ 6` (lime) + "of 18,432 players". Vertical divider. Then 3 stats: Points `285` (lime), Exact `12`, Predicted `39` — each big mono number over an uppercase mono label.
- **Leaderboard shortcut card:** full lime background, dark text (dark theme) / dark background, lime text (light theme). Giant faded "01" watermark top-right. Label "Global leaderboard", title "Sofia Lindqvist leads with 540 pts", footer "You're 255 pts behind #1" + "View table →".
- **Predict next 5:** section title "Predict your next 5 matches" + "5 upcoming · not yet picked". Then 5 rows, each a grid `150px 1fr 230px 1fr 100px`: [group + kickoff time] · [home name + flag, right-aligned] · [two empty score tiles `–  :  –`] · [away flag + name] · ["Predict" button]. These are the user's next 5 *unpredicted* upcoming matches.

### 2. Matches — `/matches`
**Purpose:** browse all matches, filter by tournament round, and enter predictions inline.
**Layout:** header → title "Matches" (+ "104 fixtures · group stage → final") → **Round filter** → **status Tabs** (`Upcoming` / `Live` / `Finished`, counts as pill badges) → tabbed content. The design shows all three states stacked as labeled bands to illustrate every row variant; in the real app these live behind the three tabs.
- **Round filter (NEW):** a "ROUND" label over a wrapping row of segmented chips — `All 104` · `Group stage 72` · `Round of 32 16` · `Round of 16 8` · `Quarter-finals 4` · `Semi-finals 2` · `Final 1`. Each chip: `padding 9px 15px`, radius 10, condensed-display label (uppercase) + a mono count badge. **Active chip** = lime fill (`#c2f23d`) with dark text and a dark-tinted count badge; **inactive** = `surface` bg (`#12161d`), hairline border, soft text (`#c8cdd6`), muted count. This is the primary way to jump between stages instead of scrolling one long list. The chip set maps to a `stage` filter on the matches query; counts are per-stage fixture totals. The status tab counts (Upcoming/Live/Finished) recompute for the **selected round** (e.g. Group stage → 33 / 2 / 37). Light theme: active chip stays lime with dark text; inactive chips use white bg + `rgba(0,0,0,.1)` border + `#3b424d` text.
- **Knockout rows:** for rounds before teams are decided, show placeholder participants ("Winner Match 17" / "Vencedor Jogo 17") with a neutral crest until the bracket resolves — the row layout is identical to group-stage rows.
- **Status tab bar:** shadcn Tabs. Active tab = 2px underline (lime dark / `#0a0d12` light) + count badge tinted to the tab's semantic color (lime/red/neutral).
- **Live row** (grid `140px 1fr 200px 1fr 220px`): [group + `67'` minute w/ pulsing red dot] · [home name+flag] · **big live score `1 : 0`** (mono 800, 44px) · [away flag+name] · [LIVE badge + "pick 2–1"]. Card has a faint red top-glow and red-tinted border.
- **Upcoming row** (grid `140px 1fr 250px 1fr 110px`): [group + kickoff time (lime)] · [home] · **the prediction widget** (two 48×54 score tiles with tiny ▲▼ steppers, `:` separator) · [away] · ["Save" button]. Open/unsaved state: tiles show `–`, Save button is muted/disabled-looking.
- **Locked upcoming row:** same grid but center shows a lime-tinted "PICK 2–0" capsule instead of editable tiles, and the trailing cell reads "✓ saved". Border picks up a faint lime tint.
- **Finished row** (grid `140px 1fr 200px 1fr 220px`): [group] · [home name+flag, soft color] · **big real score `2 : 0`** (mono 800, 40px) · [away] · ["pick 2–0" + points badge `+10/+5/+0` colored per points language].

### 3. My Predictions — `/predictions`
**Purpose:** review every prediction with running totals.
**Layout:** header → summary header (title left, 3 big stats right: Total points `285` lime, Exact scores `12`, Hit rate `31%`) over a subtle lime radial → table.
- **Table** columns: `Group | Match | Your pick | Result | Status | Points` (grid `120px 1fr 110px 110px 110px 100px`). Header row in dim mono uppercase. Each row: group label, match (flag + name `VS` flag + name in condensed display), your pick (mono 800, 18), result (mono 800, soft), status badge (per vocabulary — LIVE/FT/SCHED), points (mono 800, colored per points language; `·` when not yet scored). Hairline top border between rows.

### 4. Leaderboard — `/leaderboard`
**Purpose:** the global competitive table.
**Layout:** header → title "Global ranking" + "18,432 players · one worldwide table · updated live" → **podium** (3 cards) → ranked table → sticky "you" row.
- **Podium:** 3-col grid `1fr 1.15fr 1fr`, bottom-aligned. Center (1st) is taller/emphasized: "★ Leader" eyebrow (lime), 60px lime-gradient avatar, name, big `540` (mono 800, 46px, lime), "28 exact scores", lime border + glow (dark) / dark card with lime text (light). 2nd & 3rd are shorter neutral cards with silver/bronze rank numbers (`#c8cdd6` / `#cd8b54`) and gradient avatars.
- **Table:** columns `Pos | Player | Exact | Points` (grid `70px 1fr 140px 140px`). Rank number (mono 800) + a 32px rank chip + player name (display). Exact (muted mono), points (mono 800, right).
- **"You" row:** separated by a `· · ·` divider, then a lime-tinted highlighted row pinned for the current user: rank `47`, lime avatar, name + a lime **You** tag + `▲ 6` movement, exact, points (lime). This pattern (highlight current user, show their band even when off-screen) is the key competitive-tension moment.

### 5. Sign in — `/sign-in`  &  Sign up — `/sign-up`
**Purpose:** Better Auth email/password.
**Layout:** centered card (~max-width 368px content) on `bg` with a top radial lime glow. Logo + wordmark, big display title ("Back in the game" / "Join the table"), subtitle, then fields.
- **Fields:** label (mono uppercase, muted) over a 46–48px input (`surface` bg, hairline border, radius 10). Focused field shows lime border + `0 0 0 3px rgba(194,242,61,.1)` ring (see the password field on Sign in). Password field has a 👁 reveal affordance.
- Sign up has: Display name, Email, Password (with "8+ characters" hint).
- **Primary button:** full-width 50px, lime bg / dark text, display 800 uppercase ("Sign in" / "Create account").
- Footer link to the opposite flow (lime text).

### 6. Admin: Sync — `/admin/sync` (admin only)
**Purpose:** trigger and audit data syncs from football-data.org.
**Layout:** header (with amber Admin badge + amber admin avatar) → title "Data sync" + subtitle → control grid (1.4fr / 1fr / 1fr) → history table.
- **Control card:** "API connected" status (lime dot + label), "Last sync 2 min ago · next auto-run in 58 min", and a primary lime **"↻ Trigger manual sync"** button.
- **Two stat cards:** "Matches tracked" `104` (lime, "39 finished · 2 live · 63 scheduled"); "Last run health" `100%` ("6 of last 7 runs successful").
- **Sync history table:** columns `Run timestamp | Status | Updated | Scored | Errors` (grid `1fr 130px 140px 140px 110px`). Status badge colored by outcome: Success lime, Partial amber, Failed red — each with a matching dot.

---

## Interactions & Behavior
- **Live pulse animation** (used on every LIVE dot and the dashboard live pill): keyframes `0%,100% { opacity:1; transform:scale(1) } 50% { opacity:.35; transform:scale(.82) }`, ~1.3s infinite ease.
- **Prediction widget:** two numeric inputs (0–99, default empty), ▲▼ steppers, a Save button. Save is enabled only when both values are entered. On save → row transitions from editable tiles to the locked "PICK x–y" capsule + "✓ saved". Predictions lock at kickoff (status leaves Scheduled). This widget is reused inline in the dashboard list, matches list, and anywhere a prediction is editable.
- **Tabs (Matches):** switch Upcoming/Live/Finished; counts come from match status. Underline + active color per tab.
- **Theme toggle:** dark ↔ light, persisted. Both themes are fully specified — design them equally (this app is dark-first but ships both).
- **Scoring (display only — happens server-side):** once a match is Finished and results sync, each prediction shows `+10` (exact), `+5` (correct W/D/L outcome), or `+0`. Running totals update on Dashboard, My Predictions, and Leaderboard.
- **Hover states:** rows lift subtly (border brightens / faint bg lift); buttons darken/brighten ~6–8%; nav links go from muted to full text. (Add per your shadcn conventions — not exhaustively mocked.)

## State / Data (maps to existing schema)
- `user` (name, role user/admin, rank, points, exactCount, predictionsCount, rankChange)
- `teams` (name, crest, group) — **crests are flag emoji in this design** (e.g. 🇪🇸 🇭🇷 🇧🇷 🇫🇷); swap for real crest images if you have them.
- `groups` (A–L), `matches` (teams, kickoff, status, score, winner), `predictions` (guessed score, pointsEarned), `sync_runs` (status, matchesUpdated, matchesScored, errors).
- Match status enum drives the badge: `Scheduled | Live | Finished | Postponed | Suspended | Cancelled`.

## Assets
- **No raster assets.** Team crests are Unicode flag emoji. The logo is a CSS shape (skewed lime square + "W"). All icons are Unicode glyphs (☾ ☀ ↻ ▲ ▼ ★ ✓ 👁). Replace glyphs with your icon set (e.g. lucide) as preferred; replace flag emoji with crest images if available.
- Fonts: Saira Condensed, Saira, JetBrains Mono (Google Fonts).

## Files in this bundle
- `World Cup Predictor v2.html` — **★ current direction.** Standalone, self-contained sidebar-layout prototype (14 frames: Dashboard, Matches, Leaderboard, My Predictions, Sign in, Sign up, Admin Sync — each in dark + light). Best reference for exact look.
- `World Cup Predictor v2.dc.html` — editable source for v2 (markup, classes, and all data arrays in its logic class).
- `World Cup Predictor.html` / `World Cup Predictor.dc.html` — original top-nav version (historical reference only).

> Implement screen-by-screen using your shadcn/ui primitives. Start from the **Design Tokens** (wire the three fonts + color tokens into your Tailwind v4 theme), build the shared **Header** and the **prediction widget** first (both reused everywhere), then each route.
