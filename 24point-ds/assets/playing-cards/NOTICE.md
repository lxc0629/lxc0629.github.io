# SVG-cards — complete French playing-card deck

Artwork by David Bellot and the SVG-cards contributors. See `AUTHORS`.
This shared collection is available to any playground or other feature.

- Upstream: https://github.com/htdebeer/SVG-cards
- Version: 4.0.0
- Pinned revision: `6d88bf9c594997b82bc5668ab0877a4e9b717665`
- License: GNU Lesser General Public License 2.1; full text in `LICENSE`.
- Upstream documentation: `UPSTREAM-README.md`.
- Unmodified, editable upstream source: `source/svg-cards.svg`.
- Original source URL, SHA-256, extracted element IDs and file hashes:
  `manifest.json`.

## Contents

- 52 faces: A, 2–10, J, Q, K in spades, hearts, clubs, diamonds.
- 2 jokers: `black_joker.svg`, `red_joker.svg`.
- 2 ornamental backs: `back_red.svg`, `back_blue.svg`.

Each file is a standalone, scalable SVG, with the same `169.075 × 244.640`
viewBox. Filenames are `<rank>_of_<suit>.svg`: ranks are `ace`, `2`–`10`,
`jack`, `queen`, `king`; suits are `spades`, `hearts`, `clubs`, `diamonds`.
For example: `10_of_hearts.svg`, `jack_of_spades.svg`, `queen_of_diamonds.svg`,
`king_of_clubs.svg`.

## Processing and redistribution

Extracted each card together with its transitive internal SVG definitions.
Face illustrations, suit symbols, colors, and card proportions are unchanged.
Numeric corner indices are widened for readability: single-digit horizontal
scale is 0.85 (up from 0.56453), and 10 uses 0.50 (up from 0.32258). Vertical
scale remains 1.05741. The original editable source is preserved unmodified. The ornamental back uses the original inherited-fill design in
red (`#c52228`) and blue (`#173c78`). Added descriptive SVG titles. No scripts,
event handlers, or external resource references are used.

Regenerate all 56 files with `python3 public/assets/playing-cards/extract.py`.
The extraction script and source are included so these derived SVG assets
can be inspected, edited, and redistributed under LGPL-2.1. Keep the authors,
license, source, and this notice with redistributions of the artwork.

Game-specific values, highlights, and error marks belong to the consuming
view, not to these shared card images.
