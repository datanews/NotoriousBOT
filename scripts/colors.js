// Description:
//   Colors via
//   http://www.colourlovers.com/api
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   hubot color <hex>
//   hubot color <name>

var _ = require('lodash');
var apiColorTemplate = 'http://www.colourlovers.com/api/color/[[[COLOR]]]?format=json';
var colorNames = require('./colors-names.js');

// Get color
function getImageFromHex(hex, msg, cb) {
  hex = hex || '';
  hex = hex.replace(/#/ig, '');

  if (!hex || _.isArray(hex) || hex.length !== 8) {
    cb('Bad input');
  }

  msg.http(apiColorTemplate.replace('[[[COLOR]]]', hex)).get()(function(err, res, body) {
    var parsed;

    if (err || !res || res.length === 0) {
      cb('No response');
    }

    parsed = JSON.parse(body);
    if (!parsed || parsed.length === 0) {
      cb('Empty response');
    }

    cb(null, parsed[0].imageUrl);
  });
}

// Get hex color
function getHexArrayFromColorNames(name) {
  var found = [];

  if (colorNames[name]) {
    found = (_.isArray(colorNames[name])) ? colorNames[name] : [ colorNames[name] ];

    // Colors could be arrays of color names
    found = found.map(function(f, fi) {
      return (colorNames[f]) ? colorNames[f] : f;
    });
  }

  return found;
}

module.exports = function(robot) {
  // Handle single hex
  robot.respond(/color #([A-Fa-f0-9]{6})/i, function(msg) {
    var color = msg.match[1];

    getImageFromHex(color, msg, function(error, url) {
      if (url) {
        msg.send(url);
      }
    });
  });

  // Handle color name
  robot.respond(/color ([A-z0-9\s]+)/i, function(msg) {
    var color = msg.match[1].toLowerCase().trim().replace(/\s/ig, '');
    var colors = getHexArrayFromColorNames(color);

    if (_.isArray(colors)) {
      colors.forEach(function(c, ci) {
        getImageFromHex(c, msg, function(error, url) {
          if (url) {
            msg.send(url);
          }
        });
      });
    }
  });
}
