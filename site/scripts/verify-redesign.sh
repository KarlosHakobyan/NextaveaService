#!/usr/bin/env bash
# Verifies the redesign held its constraints. Run from the project root.
# NOTE: frontend/ is a stale duplicate tree and must never be scanned by
# this script — every glob below is scoped to js/, css/, index.html only.
set -u
fail=0
note() { printf '%-52s %s\n' "$1" "$2"; }

# --- 1. Every class used in JS must have a rule in the stylesheet ---
# Allowlist of classes that are intentionally left unstyled by design.
# List each one explicitly (no wildcards) so any OTHER unstyled class
# still fails this check.
#   features-section                                          — bare layout
#     wrapper on the home page (js/pages/home.js); no visual role of its
#     own — .section-title and .features-grid inside it carry their own
#     margins, and .hero-section above it supplies the gap.
#   page-home / page-portfolio / page-prices / page-services /
#   page-contacts / page-about                                — page-
#     identifier classes, always co-applied with .page-container (which
#     carries the actual layout rules) via `container.className =
#     'page-container page-<name>'`; .page-about is additionally used via
#     descendant selectors (e.g. `.page-about .portfolio-card`).
allowlist="features-section page-home page-portfolio page-prices page-services page-contacts page-about"
missing=""
for c in $(grep -ohE 'class="[^"$]*"' js/pages/*.js js/components/*.js \
           | sed 's/class="//; s/"//' | tr ' ' '\n' | sort -u | grep -v '^$'); do
    grep -q "\.$c\b" css/components.css && continue
    case " $allowlist " in
        *" $c "*) continue ;;
    esac
    missing="$missing $c"
done
if [ -n "$missing" ]; then
    note "class coverage" "FAIL — unstyled:$missing"; fail=1
else
    note "class coverage" "PASS"
fi

# --- 2. Only the three runtime-mutated inline styles survive ---
# (all three live in js/pages/portfolio.js: display:none on #portfolio-modal,
#  width:50% on .before-img, left:50% on .slider-handle)
n=$(grep -c 'style="' js/components/*.js js/pages/*.js | awk -F: '{s+=$2} END{print s}')
if [ "$n" -eq 3 ]; then note "inline styles (expect 3)" "PASS"
else note "inline styles (expect 3)" "FAIL — found $n"; fail=1; fi

# --- 3. Nav hrefs are route-shaped ---
# js/components/header.js was deleted in Task 2 as a dead duplicate; the
# live component tree is js/components/index.js.
if grep -qE 'href="#(services|portfolio|prices|about|contacts)"' js/components/index.js; then
    note "nav hrefs" "FAIL — slash-less href remains"; fail=1
else
    note "nav hrefs" "PASS"
fi

# --- 4. index.html has no duplicate layout placeholders ---
if grep -qE 'id="(header-container|main-content|footer-container)"' index.html; then
    note "no duplicate layout elements" "FAIL"; fail=1
else
    note "no duplicate layout elements" "PASS"
fi

# --- 5. Stylesheet hygiene ---
for pat in 'unsplash' 'style.css'; do
    if grep -qi "$pat" css/components.css; then
        note "css free of '$pat'" "FAIL"; fail=1
    else
        note "css free of '$pat'" "PASS"
    fi
done

# --- 5b. !important is confined to the prefers-reduced-motion override ---
# Task 8 legitimately added exactly four !important declarations, all
# inside the @media (prefers-reduced-motion: reduce) block, where they are
# required for the accessibility override to win.
total_important=$(grep -c '!important' css/components.css)
start_line=$(grep -n 'prefers-reduced-motion' css/components.css | head -1 | cut -d: -f1)
if [ -z "$start_line" ]; then
    note "!important confined to reduced-motion block" "FAIL — block not found"; fail=1
else
    # Find the matching closing brace for the @media block via brace counting.
    end_line=$(awk -v start="$start_line" '
        NR < start { next }
        {
            n = gsub(/\{/, "{"); depth += n
            m = gsub(/\}/, "}"); depth -= m
            if (NR >= start && depth == 0 && (n > 0 || m > 0) && seen_open) { print NR; exit }
            if (n > 0) seen_open = 1
        }
    ' css/components.css)
    in_block_count=$(awk -v s="$start_line" -v e="$end_line" \
        'NR >= s && NR <= e { c += gsub(/!important/, "!important") } END { print c+0 }' \
        css/components.css)
    if [ "$total_important" -eq 4 ] && [ "$total_important" -eq "$in_block_count" ]; then
        note "!important confined to reduced-motion block" "PASS"
    else
        note "!important confined to reduced-motion block" \
            "FAIL — total=$total_important in-block=$in_block_count (expected 4/4)"
        fail=1
    fi
fi

# --- 6. No duplicated (contradictory) selector blocks ---
# A naive "does this selector text open a rule block more than once" check
# false-positives on idiomatic CSS such as:
#     .btn-primary,
#     .btn-secondary,
#     .btn-card { <shared base properties> }
#     .btn-card { <btn-card-specific overrides — different properties> }
# — .btn-card legitimately appears once as a member of a shared-base group
# and once standalone adding NEW properties. That is not the pathology
# this check exists to catch. The pathology (present in the pre-redesign
# baseline) was the same selector declaring the SAME property twice, in
# two independent rule blocks, with different (contradictory) values —
# e.g. baseline `.portfolio-grid, .prices-grid { display: grid; gap: 25px; ... }`
# and, separately, `.portfolio-grid { display: grid; gap: 20px; ... }`.
# So: parse every top-level (non-@-rule) rule block in the stylesheet,
# split each block's selector list on commas, and for every bare
# single-class selector (".foo", ignoring compounds/pseudo-classes/
# descendant selectors) collect the set of property names declared in
# that block. Only flag a class name if two or more of the blocks it
# appears in declare an OVERLAPPING property — a genuine redeclaration —
# rather than merely appearing in more than one block.
if command -v python >/dev/null 2>&1; then
    dupes=$(python - css/components.css <<'PYEOF'
import re, sys

path = sys.argv[1]
with open(path, encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'/\*.*?\*/', '', text, flags=re.S)  # strip comments

blocks = []  # (selector_text, body_text) for depth-0 rule blocks
depth = 0
buf = []
body_start = None
for i, ch in enumerate(text):
    if ch == '{':
        if depth == 0:
            blocks.append([''.join(buf), None])
            buf = []
            body_start = i + 1
        depth += 1
    elif ch == '}':
        depth -= 1
        if depth == 0:
            blocks[-1][1] = text[body_start:i]
    else:
        if depth == 0:
            buf.append(ch)

bare_re = re.compile(r'^\.[a-zA-Z0-9_-]+$')
class_props = {}  # class -> list of property-name sets, one per block
for sel_text, body_text in blocks:
    sel_text = (sel_text or '').strip()
    if not sel_text or sel_text.startswith('@') or body_text is None:
        continue
    selectors = [s.strip() for s in sel_text.split(',') if s.strip()]
    props = set()
    for decl in body_text.split(';'):
        decl = decl.strip()
        if ':' in decl:
            prop = decl.split(':', 1)[0].strip()
            if prop:
                props.add(prop)
    for s in selectors:
        if bare_re.match(s):
            class_props.setdefault(s, []).append(props)

flagged = []
for cls, occurrences in class_props.items():
    if len(occurrences) < 2:
        continue
    overlap = set()
    for a in range(len(occurrences)):
        for b in range(a + 1, len(occurrences)):
            overlap |= occurrences[a] & occurrences[b]
    if overlap:
        flagged.append(cls.lstrip('.'))

print(' '.join(sorted(flagged)))
PYEOF
    )
    if [ -n "$dupes" ]; then note "no duplicate selectors" "FAIL — $dupes"; fail=1
    else note "no duplicate selectors" "PASS"; fi
else
    note "no duplicate selectors" "FAIL — python not found, cannot run check"; fail=1
fi

# --- 7. Dead stylesheet gone ---
[ -f css/style.css ] && { note "css/style.css removed" "FAIL"; fail=1; } \
                     || note "css/style.css removed" "PASS"

# --- 8. Braces are balanced in css/components.css ---
open_count=$(grep -o '{' css/components.css | wc -l | tr -d ' ')
close_count=$(grep -o '}' css/components.css | wc -l | tr -d ' ')
if [ "$open_count" -eq "$close_count" ]; then
    note "css braces balanced" "PASS ($open_count/$close_count)"
else
    note "css braces balanced" "FAIL — { count=$open_count } count=$close_count"
    fail=1
fi

exit $fail
