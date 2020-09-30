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
let bads = [];
let goods = [];
let card = "";

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));
app.post('/', (req, res) => {
  let groupName = req.body.groupName;
  let numOfPlayers = Number(req.body.numOfPlayers);
  let numOfBads = Number(req.body.numOfBads);
  let badsColor = req.body.bads;
  let goodsColor = badsColor === "Reds" ? "Blacks" : "Reds";
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
        createGame(numOfPlayers, numOfBads);
        res.redirect(playerURL);

        app.get(playerURL, (req, res) => {
          if (bads.includes(playerName)) {
            chooseCard(badsColor);
            res.render('card', {
              playerName: playerName,
              card: card,
              groupURL: groupURL
            });
          } else if (goods.includes(playerName)) {
            chooseCard(goodsColor); //goodColor
            res.render('card', {
              playerName: playerName,
              card: card,
              groupURL: groupURL
            });
          } else {
            res.render('loadScreen', {playerName: playerName});
          }

          console.log("group name: " + groupName);
          console.log("players: " + players);
          console.log("goods: " + goods);
          console.log("bads: " + bads);
          console.log("bads color: " + badsColor);
          console.log("goods color: " + goodsColor);

          if (numOfPlayers === players.length){
            res.render('card', {playerName: playerName, card: card});
          }
        });
      }
    });
  });
});

const createGame = (numOfPlayers, numOfBads) => {
  goods = [];
  bads = [];
  if (numOfPlayers === players.length) {
    // let numOfReds = 0;
    // if (numOfPlayers < 6)
    //   numOfReds = 1;
    // else if (numOfPlayers < 8)
    //   numOfReds = 2;
    // else
    //   numOfReds = 3;

    var chooseBads = () => {
      let badPlayerIndex;
      while (numOfBads > 0) {
        badPlayerIndex = Math.floor(Math.random() * players.length);
        let badPlayer = players[badPlayerIndex];
        if (!bads.includes(badPlayer)) {
          bads.push(badPlayer);
          numOfBads--;
        }
      }
    };

    let isbad = (playerName) => bads.includes(playerName);

    let chooseGoods = () => {
      players.forEach(p => {
        if (!bads.includes(p))
          goods.push(p);
      });
    };

    let deal = () => {
      chooseBads();
      chooseGoods();
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

  if (color === "Blacks") {
    card = "blacks/" + blacks[chooseShape()] + "_" + numbers[chooseNumber()];
  } else {
    card = "reds/" + reds[chooseShape()] + "_" + numbers[chooseNumber()];
  }
}

app.listen(process.env.PORT || 3030, () => console.log("server is up"));
