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
//   supervillains - Gets a rancdom super villain name

var superheroes = require('superheroes');
var supervillains = require('supervillains');

// Function for hubot
module.exports = function(robot) {

  // superhero command
  robot.hear(/superhero|super hero|superheros|super heros/i, function(msg) {
    msg.send('*' + superheroes.random() + '* could be your super hero.');
  });

  // supervillains command
  robot.hear(/supervillain|super villain|supervillains|super villains|supervillian|supervillians/i, function(msg) {
    msg.send('*' + supervillains.random() + '* could be your super villain.');
  });
};
