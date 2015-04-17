// Description:
//   Handles tasks for Calculon (Spark Core).  See Calculon repo for
//   hardware side
//
// Dependencies:
//   cron
//
// Configuration:
//   CALCULON_DEVICE_ID (Spark Core ID)
//   CALCULON_ACCESS_TOKEN (Spark Core account access token)
//   CALCULON_FORECAST_IO_KEY
//   CALCULON_LOCATION
//
// Commands:
//   ice cream
//   <hubot> camera <degrees_to_move>

var _ = require('lodash');
var request = require('request');
var CronJob = require('cron').CronJob;

// Environment variables
var deviceID = process.env.CALCULON_DEVICE_ID;
var accessToken = process.env.CALCULON_ACCESS_TOKEN;
var forecastKey = process.env.CALCULON_FORECAST_IO_KEY;
var forecastLocation = process.env.CALCULON_LOCATION;

// Top level vars
var sparkAPI = 'https://api.spark.io/v1';
var sparkAPIDevice = sparkAPI + '/devices/' + deviceID;
var commonHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded'
};
var forecastURL = 'https://api.forecast.io/forecast/' + forecastKey + '/' + forecastLocation;
// Environment variables set for chartbeat module
var chartbeatURL = 'https://api.chartbeat.com/live/summary/v3/?apikey=' + process.env.HUBOT_CHARTBEAT_API_KEY + '&host=' + process.env.HUBOT_CHARTBEAT_SITE + '&keys=read';
var pixels = 60;
var maxVisitors = 1000;


// Make options for commands
var commandsURLs = {
  icecream: function() {
    return {
      url: sparkAPIDevice + '/icecream',
      method: 'POST',
      headers: commonHeaders,
      form: {
        access_token: accessToken
      }
    };
  },
  chartbeat: function(count) {
    return {
      url: sparkAPIDevice + '/chartbeat',
      method: 'POST',
      headers: commonHeaders,
      form: {
        access_token: accessToken,
        params: count
      }
    };
  },
  camera: function(move) {
    return {
      url: sparkAPIDevice + '/camera',
      method: 'POST',
      headers: commonHeaders,
      form: {
        access_token: accessToken,
        params: move
      }
    };
  }
};

// Run command
function calculon(command, done) {
  var args = [].slice.apply(arguments);
  var command = args.shift();
  var done = args.shift();
  var options = commandsURLs[command].apply(this, args);
  return request(options, done);
}

// Check ice cream (for use in cron)
function makeIceCreamCheck(robot) {
  return function() {
    // Determine if temperature is good enough, then send room and Calculon
    // command
    request(forecastURL, function(error, response, body) {
      if (error) {
        console.error(error);
        return;
      }

      // Parse and check temperature
      var forecast = JSON.parse(body);
      if (forecast.currently && forecast.currently.temperature > 60) {
        calculon('icecream', function(error, response, body) {
          if (error) {
            console.error(error);
            return;
          }

          robot.messageRoom('random', 'Ice cream time!');
        });
      }
    });
  };
}

// Charbeat check (for use with cron)
function makeChartbeatCheck(robot) {
  return function() {
    // Get charbeat number
    request(chartbeatURL, function(error, response, body) {
      if (error) {
        console.error(error);
        return;
      }

      // Parse and check for number
      var chartbeat = JSON.parse(body);
      var obs;

      // Check for error
      if (chartbeat.error) {
        console.error(chartbeat.error);
        return;
      }

      if (chartbeat && chartbeat.read) {
        obs = parseInt(chartbeat.read.data.observations, 10);

        // Normalize to pixels
        obs = Math.floor(Math.min((obs / maxVisitors) * pixels, pixels));

        // Update calculon with observations
        calculon('chartbeat', function(error, response, body) {
          if (error) {
            console.error(error);
          }
        }, obs);
      }
    });
  };
}


// Function for hubot
module.exports = function(robot) {
  var cronJobs = {};

  // Scheduling.  Ice cream check
  cronJobs.icecream = new CronJob('0 0 14 * * *', makeIceCreamCheck(robot), null, true, 'America/New_York');

  // Scheduling.  Chartbeat check
  cronJobs.chartbeat = new CronJob('0 */10 * * * *', makeChartbeatCheck(robot), null, true, 'America/New_York');

  // Hear ice cream
  robot.hear(/ice[ ]*cream/i, function(msg) {
    calculon('icecream', function(error, response, body) {
      if (error || response.statusCode >= 300) {
        msg.send('There was an issue with the ice cream.');
        console.error(error);
        return;
      }

      msg.send(':icecream:');
    });
  });

  // Move camera
  robot.respond(/camera (-?[0-9]+)/i, function(msg) {
    var move = parseInt(msg.match[1], 10);

    if (_.isNaN(move) || !move) {
      move = 0;
    }

    // Move camera
    calculon('camera', function(error, response, body) {
      if (error || response.statusCode >= 300) {
        msg.send('There was an issue with the camera.');
        console.error(error);
        return;
      }

      var res = JSON.parse(body);
      // Check if it was actually moved
      if (!res.connected || res.return_value === undefined) {
        msg.send('Did not move the :camera:, it may not be connected to the internet.');
      }
      else {
        msg.send('Moving :camera: ' + move + ' degrees to position ' + res.return_value + ' (80 is the middle).');
      }
    }, move);
  });
}
