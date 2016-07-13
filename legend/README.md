# Create A Map Legend OSM XML

## Goals

* Map legend should display all osm wiki features…
* …for each zoom level, …
* …`map_features.json` should be automatically created from wiki page.
* The map legend should also contain some complex situations (which have yet to be suggested)


## Prerequisities

* node.js


## Build

* edit `map_features.json`, which basically contains map features listed at <http://wiki.openstreetmap.org/wiki/Map_Features#Commercial>
* run script: `node index.js > legend.osm`
* open `legend.osm` in JOSM, import in your local DB, etc.


