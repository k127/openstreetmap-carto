
var cfg = {
	debug: false,
	offsLat: 49,  // The latitude where you want to place the top of the legend
	offsLon: 12,  // The longitude where you want to place the left of the legend
	rowSpacing: 20
};

var builder = require('xmlbuilder');
var mapFeatures = require('./map_features');

var currentRow = cfg.offsLat;  // row [meters], will be decreased by 10m for each row

var addRow = function(xml, type, tags) {
	xml.com('title: ' + getTitle(tags));
	addLabel(xml, tags);
	addGeometry(xml, tags);
	nextRow();
};

/**
 * Add a way with 2 nodes with a name tag
 */
var addLabel = function(xml, tags) {
	addWay(xml,
		currentRow, cfg.offsLon,
		currentRow, getOffsetFromMeters(currentRow, cfg.offsLon, 0, 100).lon,
		{name: getTitle(tags), highway: 'road'});  // TODO adjust coordinates
};

var addGeometry = function(xml, tags) {
	var geomOffsLon = getOffsetFromMeters(currentRow, cfg.offsLon, 0, 120).lon;
	addWay(xml,
		currentRow, geomOffsLon,
		currentRow, getOffsetFromMeters(currentRow, geomOffsLon, 0, 100).lon,
		tags);  // TODO adjust coordinates
};

var addWay = function(xml, lat1, lon1, lat2, lon2, tags) {
	var nid1 = getUniqueId();
	var nid2 = getUniqueId();
	addNode(xml, nid1, lat1, lon1);
	addNode(xml, nid2, lat2, lon2);
	var way = xml.ele('way', {  /* <way id="26" user="Masch" uid="55988" visible="true" version="5" changeset="4142606" timestamp="2010-03-16T11:47:08Z">
			<nd ref="292403538"/><nd ref="298884289"/><nd ref="261728686"/>
			<tag k="highway" v="unclassified"/><tag k="name" v="Pastower Straße"/>
	 		</way> */
		id: getUniqueId(),
		user: '',		// TODO adjust attrs
		uid: -1,		// TODO adjust attrs
		visible: true,
		version: 1,
		//changeset: -1,	// TODO adjust attrs
		//timestamp: ''	// TODO adjust attrs
	}).ele('nd', {ref: nid1}).up().ele('nd', {ref: nid2}).up();
	for (var k in tags) way.ele('tag', {k: k, v: tags[k]});
};

var addNode = function(xml, id, lat, lon) {
	xml.ele('node', {  // <node id="298884269" lat="54.0901746" lon="12.2482632" user="SvenHRO" uid="46882" visible="true" version="1" changeset="676636" timestamp="2008-09-21T21:37:45Z"/>
		id: id,
		lat: lat,
		lon: lon,
		user: '',		// TODO adjust attrs
		uid: -1,		// TODO adjust attrs
		visible: true,
		version: 1,
		//changeset: -1,	// TODO adjust attrs
		//timestamp: ''	// TODO adjust attrs
	});
};

var getTitle = function(tags) {
	var tagStrings = [];
	for (var k in tags) tagStrings.push(k + "=" + tags[k]);
	return tagStrings.join(', ');
};

var debug = function(msg) {
	if (cfg.debug) console.log(msg);
};

var getUniqueId = function() {
	return Math.floor((1 + Math.random()) * 0x10000);
};

var nextRow = function() {
	/* global */ currentRow = getOffsetFromMeters(currentRow, cfg.offsLon, cfg.rowSpacing * -1, 0).lat;
};

/**
 * @var lat    Latitude in decimal degrees
 * @var lon    Longitude in decimal degrees
 * @var dnorth vertical offsets in meters
 * @var deast  horizontal offsets in meters
 */
var getOffsetFromMeters = function(lat, lon, dnorth, deast) {
	var R = 6378137;  // Earth’s radius, sphere
	// Coordinate offsets in radians
	dLat = dnorth / R;
	dLon = deast / (R * Math.cos(Math.PI * lat / 180));

	return {  // OffsetPosition, decimal degrees
		lat: lat + dLat * 180 / Math.PI,
		lon: lon + dLon * 180 / Math.PI
	};
};

/**
 * generally used geo measurement function
 * src: http://stackoverflow.com/a/11172685/211514
 */
var measure = function(lat1, lon1, lat2, lon2){
    var R = 6378.137; // Radius of earth in KM
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
};

var xml = builder.create('osm', {version: '1.0', encoding: 'UTF-8'});
xml.att('version', '0.6').att('generator', 'k127/osm-legend');
// TODO add <bounds minlat="54.0889580" minlon="12.2487570" maxlat="54.0913900" maxlon="12.2524800"/>

for (var i in mapFeatures.categories) {
	var category = mapFeatures.categories[i];
	debug(". category:", category.name);  // TODO only if verbose
	for (var j in category.sections) {
		var section = category.sections[j];
		debug(".. section:", section.name);  // TODO only if verbose
		addLabel(xml, {category: category.name, section: section.name});
		nextRow();
		for (var k in section.items) {
			var item  = section.items[k];
			var type  = item.types[0];				// TODO add row for each type
			debug("... item:", item.tags);  		// TODO only if verbose
			addRow(xml, type, item.tags);
		}
	}
}

/*

 <node id="298884269" lat="54.0901746" lon="12.2482632" user="SvenHRO" uid="46882" visible="true" version="1" changeset="676636" timestamp="2008-09-21T21:37:45Z"/>
 <node id="261728686" lat="54.0906309" lon="12.2441924" user="PikoWinter" uid="36744" visible="true" version="1" changeset="323878" timestamp="2008-05-03T13:39:23Z"/>
 <node id="1831881213" version="1" changeset="12370172" lat="54.0900666" lon="12.2539381" user="lafkor" uid="75625" visible="true" timestamp="2012-07-20T09:43:19Z">
  <tag k="name" v="Neu Broderstorf"/>
  <tag k="traffic_sign" v="city_limit"/>
 </node>
 ...
 <node id="298884272" lat="54.0901447" lon="12.2516513" user="SvenHRO" uid="46882" visible="true" version="1" changeset="676636" timestamp="2008-09-21T21:37:45Z"/>
 <way id="26659127" user="Masch" uid="55988" visible="true" version="5" changeset="4142606" timestamp="2010-03-16T11:47:08Z">
  <nd ref="292403538"/>
  <nd ref="298884289"/>
  ...
  <nd ref="261728686"/>
  <tag k="highway" v="unclassified"/>
  <tag k="name" v="Pastower Straße"/>
 </way>
 <relation id="56688" user="kmvar" uid="56190" visible="true" version="28" changeset="6947637" timestamp="2011-01-12T14:23:49Z">
  <member type="node" ref="294942404" role=""/>
  ...
  <member type="node" ref="364933006" role=""/>
  <member type="way" ref="4579143" role=""/>
  ...
  <member type="node" ref="249673494" role=""/>
  <tag k="name" v="Küstenbus Linie 123"/>
  <tag k="network" v="VVW"/>
  <tag k="operator" v="Regionalverkehr Küste"/>
  <tag k="ref" v="123"/>
  <tag k="route" v="bus"/>
  <tag k="type" v="route"/>
 </relation>
 ...
 */

console.log(xml.end({ pretty: true}));
