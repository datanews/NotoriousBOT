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

var apiColorTemplate = 'http://www.colourlovers.com/api/color/[[[COLOR]]]?format=json';

module.exports = function(robot) {
  robot.respond(/color #([A-Fa-f0-9]{6})/i, function(msg) {
    var color = msg.match[1];

    // Make API call
    msg.http(apiColorTemplate.replace('[[[COLOR]]]', color)).get()(function(err, res, body) {
      var parsed;

      if (err || !res || res.length === 0) {
        return;
      }

      parsed = JSON.parse(body);
      if (!parsed || parsed.length === 0) {
        return;
      }

      msg.send(parsed[0].imageUrl);
    });
  });
}
