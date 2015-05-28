// Description:
//   Random superhero name
//
// Dependencies:
//   superheros
//
// Configuration:
//
// Commands:
//   superhero - Gets a random super hero name

var superheroes = require('superheroes');

// Function for hubot
module.exports = function(robot) {

  // superhero command
  robot.hear(/superhero|super hero|superheros|super heros/i, function(msg) {
    msg.send(superheroes.random() + ' could be your superhero.');
  });
};
