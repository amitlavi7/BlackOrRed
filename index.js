const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");

const app = express();

app.set('view engine', 'ejs'); //maybe 'app.use'

app.use(express.static('public')); //for static files
app.use(bodyParser.urlencoded({
  extended: true
}));

const mainURL = "https://black-or-red.herokuapp.com";
let players = [];
let reds = [];
let blacks = [];
let card = "";

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));
app.post('/', (req, res) => {
  let groupName = req.body.groupName;
  let numOfPlayers = Number(req.body.numOfPlayers);
  let groupURL = "/" + groupName;

  //move to group page
  res.redirect(groupURL);

  app.get(groupURL, (request, response) => {
    //move to player page
    response.render('player', {url: mainURL + "" + groupURL});
    app.post(groupURL, (req, res) => {
      let playerName = req.body.playerName.toLowerCase();
      if (players.includes(playerName)) {
        // if player name is already exists, refresh page - need to add alert
        res.redirect(groupURL);
      } else {
        let playerURL = groupURL + "/" + playerName;
        players.push(playerName);
        createGame(numOfPlayers);
        res.redirect(playerURL);

        app.get(playerURL, (req, res) => {
          if (reds.includes(playerName)) {
            chooseCard("red");
            res.render('card', {
              playerName: playerName,
              card: card,
              groupURL: groupURL
            });
          } else if (blacks.includes(playerName)) {
            chooseCard("black");
            res.render('card', {
              playerName: playerName,
              card: card,
              groupURL: groupURL
            });
          } else {
            res.render('loadScreen', {playerName: playerName});
          }

          if (numOfPlayers === players.length)
            res.render('card', {playerName: playerName, card: card});
            
        });
      }
    });
  });
});

const createGame = (numOfPlayers) => {
  blacks = [];
  reds = [];
  if (numOfPlayers === players.length) {
    let numOfReds = 0;
    if (numOfPlayers < 6)
      numOfReds = 1;
    else if (numOfPlayers < 8)
      numOfReds = 2;
    else
      numOfReds = 3;

    var chooseReds = () => {
      let redPlayerIndex;
      while (numOfReds > 0) {
        redPlayerIndex = Math.floor(Math.random() * players.length);
        let redPlayer = players[redPlayerIndex];
        if (!reds.includes(redPlayer)) {
          reds.push(redPlayer);
          numOfReds--;
        }
      }
    };

    let isRed = (playerName) => reds.includes(playerName);

    let chooseBlacks = () => {
      players.forEach(p => {
        if (!reds.includes(p))
          blacks.push(p);
      });
    };

    let deal = () => {
      chooseReds();
      chooseBlacks();
      // reds.forEach(p => card("red"));
      // blacks.forEach(p => card("black"));
    };
    deal();
    players = [];
  }
}

const chooseCard = (color) => {
  let numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  let blacks = ["clubs", "spades"];
  let reds = ["hearts", "diamonds"];
  card = "";

  let chooseShape = () => Math.floor(Math.random() * 2);
  let chooseNumber = () => Math.floor(Math.random() * 14);

  if (color === "black") {
    card = "blacks/" + blacks[chooseShape()] + "_" + numbers[chooseNumber()];
  } else {
    card = "reds/" + reds[chooseShape()] + "_" + numbers[chooseNumber()];
  }
}

app.listen(process.env.PORT || 3030, () => console.log("server is up"));
