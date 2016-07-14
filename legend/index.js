
var cfg = {
	debug: false,
	offsLat: 49,  // The latitude where you want to place the top of the legend
	offsLon: 12,  // The longitude where you want to place the left of the legend
	rowSpacing: 20
};

var instance = {
	zoom: -1,
	row: -1.0,
	lon: -1.0,
	scale: -1.0
};

var builder = require('xmlbuilder');
var mapFeatures = require('./map_features');

var addRow = function(xml, types, tags) {
	xml.com('title: ' + getTitle(tags));
	addLabel(xml, tags);
	addGeometries(xml, types, tags);
	nextRow();
};

/**
 * Add a way with 2 nodes with a name tag
 */
var addLabel = function(xml, tags) {
	/* global */ instance;
	var width = 100;
	// TODO: width = ...instance.zoom...
	xml.com('label');
	addWay(xml, [
		{lat: instance.row, lon: instance.lon},
		{lat: instance.row, lon: getZoomedOffsetFromMeters(instance.row, instance.lon, 0, width).lon}
	], {name: getTitle(tags), highway: 'road'});
};

var addGeometries = function(xml, types, tags) {
	var nodeGeomOffsLon = getZoomedOffsetFromMeters(instance.row, instance.lon, 0, 120).lon;  // TODO put to cfg
	var wayGeomOffsLon  = getZoomedOffsetFromMeters(instance.row, instance.lon, 0, 140).lon;  // TODO put to cfg
	var areaGeomOffsLon = getZoomedOffsetFromMeters(instance.row, instance.lon, 0, 220).lon;  // TODO put to cfg
	if (types.indexOf('node') !== -1) {
		addNode(xml, (instance.row + '++' + nodeGeomOffsLon).hashCode(), instance.row, nodeGeomOffsLon, tags);
	}
	if (types.indexOf('way') !== -1) {
		addWay(xml, [
			{lat: instance.row, lon: wayGeomOffsLon},
			{lat: instance.row, lon: getZoomedOffsetFromMeters(instance.row, wayGeomOffsLon, 0, 60).lon}
		], tags);
	}
	if (types.indexOf('area') !== -1) {
		var x1 = areaGeomOffsLon;
		var x2 = getZoomedOffsetFromMeters(instance.row, areaGeomOffsLon, 0, 15).lon;
		var y1 = getZoomedOffsetFromMeters(instance.row, areaGeomOffsLon, -5, 0).lat;
		var y2 = getZoomedOffsetFromMeters(instance.row, areaGeomOffsLon, 5, 0).lat;
		addWay(xml, [
			{lat: y1, lon: x1},
			{lat: y2, lon: x1},
			{lat: y2, lon: x2},
			{lat: y1, lon: x2}
		], tags, true);
	}
};

var addWay = function(xml, nodes, tags, closed) {
	for (var i in nodes) {
		var node = nodes[i];
		node.id = (node.lat + '++' + node.lon).hashCode();
		addNode(xml, node.id, node.lat, node.lon);
	}
	var way = xml.ele('way', {
		id: (JSON.stringify(nodes)).hashCode(),
		user: '',		// TODO adjust attrs
		uid: -1,		// TODO adjust attrs
		visible: true,
		version: 1,
		//changeset: -1,	// TODO adjust attrs
		//timestamp: ''	// TODO adjust attrs
	});
	for (var j in nodes) way.ele('nd',  {ref: nodes[j].id});
	if (closed)          way.ele('nd',  {ref: nodes[0].id});
	for (var k in tags)  way.ele('tag', {k: k, v: tags[k]});
};

var addNode = function(xml, id, lat, lon, tags) {
	var node = xml.ele('node', {
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
	if (tags !== "undefined" || tags.length !== 0)
		for (var k in tags) node.ele('tag', {k: k, v: tags[k]});
};

var getTitle = function(tags) {
	var tagStrings = [];
	for (var k in tags) tagStrings.push(k + "=" + tags[k]);
	return tagStrings.join(', ');
};

var debug = function(msg) {
	if (cfg.debug) console.log(msg);
};

/* var getUniqueId = function() {
	return Math.floor((1 + Math.random()) * 0x10000);
}; */

/**
 * src: http://stackoverflow.com/a/7616484/211514
 */
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  hash = hash >>> 0; // unsign the int
  return hash;
};

var nextRow = function() {
	/* global */ instance.row = getZoomedOffsetFromMeters(instance.row, instance.lon, cfg.rowSpacing * -1, 0).lat;
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

var getZoomedOffsetFromMeters = function(lat, lon, dnorth, deast) {
	/* global */ instance;
	return getOffsetFromMeters(lat, lon, dnorth * instance.scale, deast * instance.scale);
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

var main = function() {
	var xml = builder.create('osm', {version: '1.0', encoding: 'UTF-8'});
	xml.att('version', '0.6').att('generator', 'k127/osm-legend');
	// TODO add <bounds minlat="54.0889580" minlon="12.2487570" maxlat="54.0913900" maxlon="12.2524800"/>

	for (var z = 10; z <= 15; z++) {
		instance.zoom = z;
		instance.scale = 10000 / Math.pow(2, instance.zoom);  // TODO adjust
		instance.row = cfg.offsLat;  // row [meters], will be decreased by 10m for each row
		instance.lon = getZoomedOffsetFromMeters(instance.row, cfg.offsLon, 0, 400).lon;
		xml.com('zoom: ' + instance.zoom + ' scale: ' + instance.scale + ' lon: ' + instance.lon);
		debug(". zoom level:", instance.zoom);
		addLabel(xml, {zoom: instance.zoom});
		nextRow();
		for (var i in mapFeatures.categories) {
			var category = mapFeatures.categories[i];
			debug(".. category:", category.name);  // TODO only if verbose
			for (var j in category.sections) {
				var section = category.sections[j];
				debug("... section:", section.name);  // TODO only if verbose
				var tags = {category: category.name};
				if (section.name !== "") tags.section = section.name;
				addLabel(xml, tags);
				nextRow();
				for (var k in section.items) {
					var item  = section.items[k];
					debug(".... item:", item.tags);  		// TODO only if verbose
					addRow(xml, item.types, item.tags);
				}
			}
		}
	}
	console.log(xml.end({ pretty: true}));
}

main();
