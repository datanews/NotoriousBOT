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
//
// Commands:
//   icecream

var _ = require('lodash');
var request = require('request');
var CronJob = require('cron').CronJob;

// Environment variables
var deviceID = process.env.CALCULON_DEVICE_ID;
var accessToken = process.env.CALCULON_ACCESS_TOKEN;

// Top level vars
var sparkAPI = 'https://api.spark.io/v1';
var sparkAPIDevice = sparkAPI + '/devices/' + deviceID;


// Make options for commands
var commandsURLs = {
  icecream: function() {
    return {
      url: sparkAPIDevice + '/icecream',
      method: 'POST',
      form: {
        access_token: accessToken
      }
    };
  },
  chartbeat: function(count) {
    return {
      url: sparkAPIDevice + '/chartbeat',
      method: 'POST',
      form: {
        access_token: accessToken,
        params: count
      }
    };
  }
};

// Run command
function calculon(command, done) {
  var args = arguments;
  [].splice.apply(args, 0, 2);
  var options = commandsURLs[command].apply(this, args);
  return request(options, done);
}


//
module.exports = function(robot) {
  var cronJobs = {};

  // Scheduling.  Ice cream check
  cronJobs.icecream = new CronJob('0 0 14 * * *', function() {
    // Determine if temperature is good enough, then send room and Calculon
    // command
    if (false) {
      calculon('icecream', function(error, response, body) {
        if (error) {
          console.error(error);
        }

        robot.messageRoom('random', 'Ice cream time!');
      });
    }
  }, null, true, 'America/New_York');

  // Scheduling.  Chartbeat check
  cronJobs.icecream = new CronJob('0 /10 * * * *', function() {
    // Get Chartbeat API numbers an dupdate calculon
    calculon('icecream', function(error, response, body) {
      if (error) {
        console.error(error);
      }
    });
  }, null, true, 'America/New_York');


  // Hear ice cream
  robot.hear(/ice[ |]cream/i, function(msg) {
    calculon('icecream', function(error, response, body) {
      msg.send(':icecream:');
    });
  });
}
