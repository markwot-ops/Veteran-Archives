# Test harnesses — run these before shipping a shell change

These exist because a change that *parsed cleanly* blanked every map in the archive.
Checking syntax proves nothing. Run the page.

## Setup

Put the shell and the data files in one folder, then:

    npm install jsdom

Expected filenames (as produced during a build session):

    template.html                honor-roll-map.html          landing_index.html
    calvary_data_new.js          forestdale_data_new.js       elmwood_data_new.js
    rock-valley_data_new.js      smiths-ferry_data_new.js     research-queue_data_new.js

## The tests

    node test_index.js research-queue      # any of the six sites
    node test_honormap.js "Medal of Honor" "MacKenzie"
    node test_landing.js

**test_index.js** — loads the real shell with real data, stubs Leaflet, and asserts rows
actually render. Then it filters by era, searches, and scrolls, because each of those has
blanked the list at least once.

**test_honormap.js** — asserts the honor map merges all six sites, lights the row from
`?honor=`, dims the rest, and flies to the man's real coordinates when you click him.
Second argument picks a specific man by name.

**test_landing.js** — asserts the landing box reads every site and lists only honors the
map can actually filter.

## What they have caught

- `buildSidebar()` wiping `#pad-top`/`#rows`/`#pad-bot` → **every map blank on all six sites**
- a throw in the scroll-feel block killing the page, index and all
- scrolling past the end of a filtered list drawing zero rows
- the landing box offering honors the map's box couldn't filter
- 199 Forestdale men with no `id`, silently collapsing into one

## Run them ALL after touching the shell

`template.html` is copied to six sites and is the base of `honor-roll/index.html`.
One mistake in it is six broken maps.
