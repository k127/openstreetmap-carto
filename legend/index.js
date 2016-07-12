
var config = {
	gridOffsetLat: 0,  // The latitude where you want to place the top of the legend
	gridOffsetLon: 0   // The longitude where you want to place the left of the legend
};

var builder = require('xmlbuilder');
var mapFeatures = require('./map_features');
var osmXmlTemplate = "";  // TODO replace string with some XML DOM

for (var i in mapFeatures.categories) {
	var category = mapFeatures.categories[i];
	console.log(". category:", category.name);  // TODO only if verbose
	for (var j in category.sections) {
		var section = category.sections[j];
		console.log(".. section:", section.name);  // TODO only if verbose
	}
}
