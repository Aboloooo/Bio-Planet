# Bio-Planet staff tools — Design system

Touchscreen tools for Bio-Planet store staff (Gasperich): **Product ID Finder** and **Expiry Date Tracker**.
Feeling: calm, clear, quick to scan from arm's length. One job per screen; the number staff need (product ID, shelf row) is always the biggest thing.

Figma source: https://www.figma.com/design/p28AT7xTc3MlzAVwgrFgfb — page "Redesign v1", variable collection "Bio-Planet".

## Color

Brand colors are taken from the Bio-Planet logo (`Images/Bio-Planet icon.png`). No official Colruyt Group brand guide was available; confirm values with Bio-Planet marketing before print use.

| Token | Value | Role |
|---|---|---|
| `brand/blue-700` | `#30549C` | Primary. Primary buttons, active tab, selected chip, IDs, links. White text on it: 7.3:1 |
| `brand/blue-800` | `#1F3C78` | Pressed state of primary |
| `brand/blue-600` | `#006CB4` | Logo globe blue. Focus ring |
| `brand/blue-100` | `#DCE8F6` | Borders of blue-tinted surfaces |
| `brand/blue-50` | `#EEF4FB` | ID boxes, secondary buttons, icon buttons |
| `brand/green-500` | `#90A824` | Logo leaf only. **Not used in the UI** — on screen it reads as yellow. Highlights use blue instead |
| `bg/canvas` | `#F5F6F2` | Screen background |
| `bg/surface` | `#FFFFFF` | Cards, header, inputs, dialogs |
| `bg/subtle` | `#F0F2F5` | Segmented controls, list rows |
| `border/default` | `#E1E6EC` | Decorative card and divider lines |
| `border/strong` | `#8794A6` | Input and control outlines (3.1:1, meets non-text contrast) |
| `text/primary` | `#12233D` | Headings and body (14.5:1) |
| `text/secondary` | `#56677D` | Supporting text (5.8:1) |
| `text/muted` | `#66758A` | Placeholders, meta (4.7:1 on white — do not put on `bg/subtle`) |
| `status/danger` / `-bg` | `#C62F2F` / `#FDECEC` | "À collecter" (4.8:1) |
| `status/warning` / `-bg` | `#94560A` / `#FFF2DD` | "Expire bientôt" (5.3:1) |
| `status/success` / `-bg` | `#1B6E3F` / `#E5F5EB` | "OK" (5.6:1) |
| `status/neutral` / `-bg` | `#56677D` / `#ECEFF3` | "Expiré" (5.0:1) |

Status is never shown by color alone: every badge has an icon and a word.
No dark mode (in-store kiosk, bright environment).

## Typography

Headings: **Plus Jakarta Sans**. Body and UI: **Manrope**. Numbers (IDs, rows) use Plus Jakarta Sans ExtraBold for legibility at a distance.

| Style | Font | Size / line | Use |
|---|---|---|---|
| Display/Large | Jakarta ExtraBold | 40 / 48 | Rare, empty states |
| Heading/H1 | Jakarta Bold | 28 / 36 | Screen titles, summary counts |
| Heading/H2 | Jakarta Bold | 20 / 28 | Card titles, brand name |
| Heading/H3 | Jakarta SemiBold | 16 / 22 | Product names on cards |
| Body/Large | Manrope Medium | 18 / 26 | Search and input text |
| Body/Default | Manrope Medium | 16 / 24 | Body text (min. 16 px) |
| Body/Strong | Manrope Bold | 16 / 24 | Buttons, chips, row titles |
| Body/Small | Manrope SemiBold | 14 / 20 | Labels, meta, badges |
| Label/Caps | Manrope Bold | 12 / 16, +0.8, UPPERCASE | "ID", "RANGÉE" eyebrow labels |
| Data/ID | Jakarta ExtraBold | 22 / 28 | IDs on cards, row numbers |
| Data/ID Large | Jakarta ExtraBold | 48 / 56 | ID in the product dialog |

## Spacing

4-based scale: **4, 8, 12, 16, 20, 24, 32, 48**.
Screen padding 32 (desktop kiosk 1280×900), 16 on phones. Gap between sections 20–24; inside cards 12–18.

## Shape and depth

Radius: **sm 8** (badges), **md 12** (icon buttons, small controls), **lg 16** (buttons, inputs, list rows, toasts), **xl 24** (cards, dialogs), **pill** (chips).
Shadows: **raised** `0 2 8 rgba(18,35,61,.06)` for cards; **overlay** `0 24 60 rgba(13,26,51,.25)` for dialogs. Nothing else.

## Components

- **Button** — Primary (blue-700, white text), Secondary (blue-50, blue-700 text, blue-100 border), Ghost (text only). Min height 48, padding 14×22, radius lg, icon left. States: pressed = blue-800, focus = 3 px blue-600 ring, disabled = 40 % opacity.
- **Category Chip** — 48 px tall pill, label + count bubble. Selected: blue-700 fill, count bubble white with blue-700 text.
- **Product Card** — photo 4:3, name (H3, 2 lines max), ID box (blue-50) with large ID and a 40 px copy button.
- **Text Field** — label above, 56 px input, `border/strong` outline, trailing button: keyboard / keypad / calendar.
- **Status Badge** — Collect, Soon, Expired, OK; icon + word, radius sm.
- **Expiry rules** (set by the store owner): **À collecter** = not collected and < 3 days before expiry (expired included); **Expire bientôt** = not collected and ≤ 10 days; **OK** = more than 10 days. Summary tiles show the rule under the number.
- **Period filter** — "Du → Au" on the tracked-products list (opens the on-screen calendar), with "Marquer N collectés" for the period (undo in toast) and a ✓ collect button on each row.
- **App Header** — 76 px, sticky: logo + name, language switch, date.
- **App Switcher** — full-width bar between header and content (not in the header): two 56 px tabs, active tab solid blue-700 with white text.
- **Search bar** — sticky under the header; slides up out of view when scrolling down (320 ms ease-in) and comes back when scrolling up (200 ms ease-out, faster). Always visible while typing.
- **Popups** (product, keyboard, keypad, row picker, calendar, delete) — always fixed in the centre of the screen, whatever the scroll position.
- **Toast** — dark (`text/primary`) bar, bottom centre, 4 s. Confirmation ("ID 80231 copié") or Undo ("Houmous Bio marqué collecté · Annuler").
- **Empty State** — icon, title, one sentence: what the list is, why it is empty, what happens next.

## Wording (FR)

One word per idea, matching what staff already say:
- **collecter** = pull a product off the shelf ("À collecter aujourd'hui", "Marquer collecté", "Voir les collectés").
- **supprimer du suivi** = delete a tracked entry ("Supprimer « Houmous Bio » du suivi ?" → "Supprimer" / "Garder").
- Buttons start with a verb and say what happens. Always use accents (Légumes, trouvés) — the old app dropped them.
- Touch targets: **at least 48×48 px** everywhere (kiosk, gloves, quick taps).

## Imagery and icons

- Product photos on white, cropped to fill (4:3 on cards, square in dialogs).
- Icons: one outline set (Lucide style), 2 px stroke, 18–24 px. No emoji as icons (they render inconsistently — the old 📋 button showed as an empty box).

## Avoid

Blue fills on every surface, any yellow or yellow-green (the old #C8D400), text on green-500 in white, tiny "Retirer" links, color-only status.
