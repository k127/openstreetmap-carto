# Create A Map Legend OSM XML

## Prerequisities

* node.js


## Build

* edit `map_features.json`, which basically contains map features listed at <http://wiki.openstreetmap.org/wiki/Map_Features#Commercial>
* run script: `node index.js > legend.osm`
* open `legend.osm` in JOSM, import in your local DB, etc.


