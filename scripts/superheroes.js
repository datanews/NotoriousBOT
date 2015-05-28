// Description:
//   Random superhero name
//
// Commands:
//   <hubot> superhero - Gets a random super hero name
//
// Dependencies:
//   superheros
//
// Configuration:
//
// Commands:
//   <hubot> superhero

var superheroes = require('superheroes');

// Function for hubot
module.exports = function(robot) {

  // superhero command
  robot.respond(/superhero/i, function(msg) {
    msg.send(superheroes.random());
  });
};
