# Handoff spec — Redesign v1 (Finder, Product detail, Expiry Tracker)

Design: https://www.figma.com/design/p28AT7xTc3MlzAVwgrFgfb — page "Redesign v1", frames **A · Product Finder**, **B · Product Detail**, **C · Expiry Tracker**.
System and tokens: see `DESIGN.md`. Stack: `index.php` (static HTML), `style.css`, `script.js` (jQuery 3.6), PHP endpoints unchanged.

## Overview

Store staff use a touchscreen kiosk (1280×900, landscape) to find a product's ID and to track expiry dates by shelf row. The redesign makes the needed number the biggest thing on screen, makes every control at least 48 px, and puts "what to do today" at the top of the tracker. No behaviour changes in the PHP endpoints.

## 1. Tokens — add to the top of `style.css`

```css
:root {
  --blue-800:#1F3C78; --blue-700:#30549C; --blue-600:#006CB4; --blue-100:#DCE8F6; --blue-50:#EEF4FB;
  --green-500:#90A824; --green-700:#56701A; --green-100:#EEF4DA;
  --bg-canvas:#F5F6F2; --bg-surface:#FFFFFF; --bg-subtle:#F0F2F5;
  --border-default:#E1E6EC; --border-strong:#8794A6;
  --text-primary:#12233D; --text-secondary:#56677D; --text-muted:#66758A; --text-on-brand:#FFFFFF;
  --danger:#C62F2F; --danger-bg:#FDECEC; --warning:#94560A; --warning-bg:#FFF2DD;
  --success:#1B6E3F; --success-bg:#E5F5EB; --neutral:#56677D; --neutral-bg:#ECEFF3;
  --space-1:4px; --space-2:8px; --space-3:12px; --space-4:16px; --space-5:20px; --space-6:24px; --space-8:32px; --space-12:48px;
  --radius-sm:8px; --radius-md:12px; --radius-lg:16px; --radius-xl:24px; --radius-pill:999px;
  --shadow-raised:0 2px 8px rgba(18,35,61,.06); --shadow-overlay:0 24px 60px rgba(13,26,51,.25);
  --font-heading:"Plus Jakarta Sans",sans-serif; --font-body:"Manrope",sans-serif;
  --tap:48px;
}
```

Replace every raw colour in `style.css` with these variables. Load Manrope 400–800 and Plus Jakarta Sans 600–800 (already in `index.php`).

## 2. Typography classes

| Class | Font | Size / line | Use |
|---|---|---|---|
| `.t-h1` | heading 700 | 28/36 | Screen title, summary counts |
| `.t-h2` | heading 700 | 20/28 | Card titles |
| `.t-h3` | heading 600 | 16/22 | Product name on card (clamp 2 lines) |
| `.t-body-lg` | body 500 | 18/26 | Search + inputs |
| `.t-body` | body 500 | 16/24 | Default text |
| `.t-strong` | body 700 | 16/24 | Buttons, chips |
| `.t-small` | body 600 | 14/20 | Labels, meta, badges |
| `.t-caps` | body 700 | 12/16, +0.8px, uppercase | "ID", "RANGÉE" |
| `.t-id` | heading 800 | 22/28, `font-variant-numeric: tabular-nums` | IDs on cards, row numbers |
| `.t-id-xl` | heading 800 | 48/56, tabular | ID in dialog |

## 3. Layout

- Body: `background: var(--bg-canvas)`; app width 100%, content padding `var(--space-8)` (32) left/right, `28px` top.
- **Header** `.app-header`: height 76, white, bottom border `--border-default`, padding 0 32, flex row, gap 24: brand · flex spacer · `.app-tabs` · flex spacer · `.lang` · date.
- **A Finder**: column, gap 20 → search (height 68) → chips row (height 48, gap 10, horizontal scroll if it overflows) → grid `display:grid; grid-template-columns: repeat(auto-fill, minmax(216px, 1fr)); gap:16px`.
- **C Tracker**: two columns `grid-template-columns: 1fr 352px; gap:24px`. Left column gap 20: title → summary tiles (4 equal, gap 12) → "À collecter aujourd'hui" card → "À venir" card. Right: "Ajouter un produit" card, full height, button pinned at the bottom.

## 4. Components

| Component | Markup / class | Spec |
|---|---|---|
| Button | `.btn.btn--primary / --secondary / --ghost` | min-height 48, padding 14 22, radius lg, gap 10, icon 20 left. Primary: bg blue-700, text white. Secondary: bg blue-50, text blue-700, 1px blue-100 border. |
| App tabs | `.app-tabs` (`role="tablist"`) > `.app-tab` | track bg subtle, padding 4, radius lg; tab height 48, radius md; active: white bg + shadow-raised, blue-700 text |
| Language | `.lang` > `button` | 48×48 each, radius md; active bg blue-700 white text |
| Search | `.search` | height 68, radius lg, 1.5px `--border-strong`, shadow `0 4px 16px rgba(18,35,61,.06)`; icon 26 blue-700; "Clavier" secondary button 48 tall |
| Category chip | `.chip[aria-pressed]` | height 48, radius pill, padding 0 10 0 18; count bubble padding 3 9 radius md. Selected: bg blue-700, white label, bubble green-500 with `--text-primary` text |
| Product card | `.product-card` (`button`) | radius xl, border default, shadow-raised; photo 4:3 `object-fit:cover`; body padding 12 14 14, gap 10; ID box bg blue-50 radius lg padding 6 6 6 12: "ID" `.t-caps` + `.t-id` blue-700 + 48×48 copy button (white, radius md) |
| Product dialog | `.modal` (`role="dialog" aria-modal="true"`) | scrim `rgba(18,35,61,.55)`; panel white radius xl, padding 24 32 24 24, gap 32, shadow-overlay; photo 340 wide fills height, radius lg; info column 380: category tag (green-100 bg, green-700 text) + close (48, bg subtle) → name `.t-h1` → ID block (blue-50, border blue-100, radius lg, padding 16 20 18) → hint → Primary "Copier l'ID" + Secondary "Ajouter au suivi des dates" full width |
| Status badge | `.badge.badge--collect/soon/expired/ok` | padding 6 12 6 10, radius sm, icon 16 + `.t-small`; colours per DESIGN.md |
| Summary tile | `.tile.tile--*` | radius xl, padding 14 18, bg status-bg, number `.t-h1` + label `.t-strong` in status colour |
| Collect row | `.collect-row` | bg subtle, radius lg, padding 10 8 10 12, gap 16: row box (white, border, radius md, "RANGÉE" + `.t-h2` blue-700) · name + meta · badge · Primary "Marquer collecté" |
| Upcoming row | `.upcoming-row` | top border default, padding 10 0, gap 16: `R33` blue-700 · name · ID · date · badge · 48×48 "⋮" menu (bg subtle) with "Supprimer du suivi" |
| Text field | `.field` | label `.t-small` secondary; input height 60, radius lg, 1.5px border-strong, padding 0 8 0 16; trailing 48 button (blue-50): keyboard / keypad / calendar |
| Row stepper | `.stepper` | − / value / +: buttons 54×54 blue-50, value box border-strong, `.t-id` |
| Toast | `.toast` (`role="status" aria-live="polite"`) | bg text-primary, white `.t-strong`, radius lg, padding 14 22, green-500 check circle; bottom 32 centred; Undo variant adds 48-tall "Annuler" button |
| Empty state | `.empty` | bg subtle, radius lg, padding 32 24, centred: icon in green-100 circle, `.t-h2`, `.t-body` secondary |

## 5. States and interactions

| Element | State | Behaviour |
|---|---|---|
| All buttons/chips/cards | Pressed (`:active`) | Primary → blue-800; Secondary → blue-100; Ghost/subtle → bg subtle; cards `transform: scale(.98)` |
| All controls | Focus (`:focus-visible`) | `outline: 3px solid var(--blue-600); outline-offset: 2px` |
| Buttons | Disabled | `opacity:.4; pointer-events:none` |
| Product card | Tap | Opens dialog. **Fix bug**: use `String($(this).attr("data-id"))`, not `$(this).data("id")` (jQuery converts it to a number and the lookup fails) |
| Copy button (card or dialog) | Tap | `navigator.clipboard.writeText(id)`; show toast "ID {id} copié" for 4 s; fall back to the existing `prompt()` |
| "Ajouter au suivi des dates" | Tap | Close dialog, switch to Tracker tab, prefill name + ID fields, focus the date field |
| Chip | Tap | Filter grid; `aria-pressed="true"` on the selected chip |
| "Marquer collecté" | Tap | Mark `collected:true`, remove row, update counts, toast "{name} marqué collecté" with "Annuler" (restores) for 6 s |
| "Voir les collectés (1)" | Tap | Toggles collected rows; label becomes "Masquer les collectés" |
| ⋮ menu | Tap | Sheet with "Supprimer du suivi" → confirm dialog "Supprimer « {name} » du suivi ?" buttons "Supprimer" (danger) / "Garder" |
| Search | Typing | Filter as you type (existing); accent-insensitive (already shipped) |

## 6. Responsive

| Width | Changes |
|---|---|
| ≥ 1024 (kiosk) | As designed |
| 768–1023 | Tracker: form panel moves below the lists, full width; grid auto-fills to 3 columns |
| < 768 (phone) | Header: logo + tabs only (language + date move into a menu); tabs show icon + short label ("Recherche", "Dates"); content padding 16; grid 2 columns; summary tiles 2×2; collect rows stack button under text |

## 7. Edge cases and copy (FR)

- **No search results**: Empty state "Aucun produit pour « {query} »" + "Vérifiez l'orthographe ou signalez le produit manquant." + Secondary "Signaler un produit manquant" (opens the existing note form).
- **Nothing to collect**: Empty state "Rien à collecter aujourd'hui" / "Les produits apparaissent ici 10 jours avant leur date d'expiration."
- **Product without ID** (`"id": "#"` in data.json): show "ID manquant" in muted text, disable copy.
- **Long names**: clamp to 2 lines on cards (`-webkit-line-clamp:2`), full name in dialog.
- **Missing photo**: bg subtle placeholder with the category icon.
- **Server sync failure** (`expiry_storage.php`): toast "Enregistré sur cet appareil. Synchronisation impossible — réessai automatique." No blocking banner.
- **Translations**: NL strings run ~30% longer; buttons must wrap to 2 lines rather than truncate.

## 8. Motion

| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Dialog | Open/close | fade scrim + panel `translateY(12px)→0` | 180 ms | ease-out |
| Toast | Show/hide | `translateY(16px)→0` + fade | 200 ms | ease-out |
| Collected row | Mark collected | height collapse + fade | 220 ms | ease-in-out |
| All | `prefers-reduced-motion` | Disable transforms, keep fades ≤ 100 ms | — | — |

## 9. Accessibility

- Focus order: header tabs → language → search → keyboard button → chips → grid (row by row). In the dialog, focus starts on "Copier l'ID", is trapped inside, Escape closes and returns focus to the card.
- Product card is a `<button>` with `aria-label="{name}, ID {id}"`; copy button `aria-label="Copier l'ID {id}"`.
- App switcher: `role="tablist"` / `role="tab"` / `aria-selected`; panels `role="tabpanel"`.
- Status: badges include the word; summary tiles are `<a>`/buttons that filter the list.
- Toast region `role="status" aria-live="polite"`.
- Every input has a visible `<label>`. The date field opens the calendar but also accepts typing.
- Images: `alt="{product name}"`.
- Contrast: all text pairs ≥ 4.5:1 and control borders ≥ 3:1 (values in DESIGN.md).
