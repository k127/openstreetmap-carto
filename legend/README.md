# Create A Map Legend OSM XML

## Goals

* Map legend should display all osm wiki features…
* …for each zoom level, …
* …`map_features.json` should be automatically created from wiki page.
* Output format should be suitable to be imported as `openstreetmap-carto` suggests.
* Nice to have: the map legend should contain some complex situations (which have yet to be suggested)


## Prerequisities

* node.js


## Build

* edit `map_features.json`, which basically contains map features listed at <http://wiki.openstreetmap.org/wiki/Map_Features#Commercial>
* run script: `node index.js > legend.osm`
* open `legend.osm` in JOSM, import in your local DB, etc.


