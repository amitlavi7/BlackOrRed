const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const shortid = require('shortid');
const timeout = require('connect-timeout');

const app = express();

app.set('view engine', 'ejs');

// app.use(express.static('public')); //for static files
app.use("/", express.static(__dirname + "/public")); //for static files

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(timeout('600s'));
app.use(haltOnTimedout);

const mainURL = "https://black-or-red.herokuapp.com";
let gamesData = {};

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));

app.get('/howtoplay', (req, res) => res.sendFile(__dirname + "/howToPlay.html"));

app.post('/', (req, res) => {
  //add validations
  const gameID = shortid.generate();
  const gameData = {
    groupName: req.body.groupName,
    numOfPlayers: Number(req.body.numOfPlayers),
    numOfBads: Number(req.body.numOfBads),
    badsColor: req.body.bads,
    goodsColor: req.body.bads === "Reds" ? "Blacks" : "Reds",
    groupURL: "/" + gameID,
    players: [],
    bads: [],
    goods: [],
    openResponses: []
  };

  gamesData[gameID] = gameData;

  //move to group page
  res.redirect(gameData.groupURL);
});

  //move to player page
app.get('/:groupID', (req, res) => {
  const groupID = req.params.groupID;
  res.render('player', {url: mainURL + "/" + groupID});
});

app.post('/:groupID', (req, res) => {
  const groupID = req.params.groupID;
  let playerName = req.body.playerName.toLowerCase();
  const gameInfo = gamesData[groupID];

  // if player name is already exists, refresh page - need to add alert
  if (gameInfo.players.includes(playerName)) {
    res.redirect(gameInfo.groupURL);
  } else {
    let playerURL = gameInfo.groupURL + "/" + playerName;
    if(playerName)
      gameInfo.players.push(playerName);
    if(gameIsReady(gameInfo)){
      createGame(gameInfo);
      const tempResponses = gameInfo.openResponses;
      gameInfo.openResponses = [];
      tempResponses.forEach(response => {
        response.res.redirect(response.playerURL);
      });
    }
    res.redirect(playerURL);
  }
});

app.get('/:groupID/:playerName', (req, res) => {

  //add timeout?

  let card;
  const playerName = req.params.playerName;
  const groupID = req.params.groupID;
  const gameInfo = gamesData[groupID];
  const playerURL = "/" + groupID + "/" + playerName;

  console.log(gamesData);

  if (gameInfo.bads.includes(playerName)) {
    const index = gameInfo.bads.indexOf(playerName);
    gameInfo.bads[index] = undefined;
    card = chooseCard(gameInfo.badsColor);
    // res.render('card', {
    //   playerName: playerName,
    //   card: card,
    //   createGame: createGame,
    //   gameInfo: gameInfo
    // });
    res.render('card', {
      playerName: playerName,
      card: card,
      groupURL: gameInfo.groupURL
    });
  } else if (gameInfo.goods.includes(playerName)) {
    const index = gameInfo.goods.indexOf(playerName);
    gameInfo.goods[index] = undefined;
    card = chooseCard(gameInfo.goodsColor); //goodColor
    // res.render('card', {
    //   playerName: playerName,
    //   card: card,
    //   createGame: createGame,
    //   gameInfo: gameInfo
    // });
    res.render('card', {
      playerName: playerName,
      card: card,
      groupURL: gameInfo.groupURL
    });
  } else {
    gameInfo.openResponses.push({
      res,
      playerURL
    });
  }
});

const gameIsReady = (gameInfo) => gameInfo.numOfPlayers === gameInfo.players.length;

const createGame = (gameInfo) => {
  console.log("new game has been created!!");
  console.log(gameInfo);
  gameInfo.goods = [];
  gameInfo.bads = [];
    var chooseBads = () => {
      let badPlayerIndex;
      let badCount = gameInfo.numOfBads;
      while(badCount != 0) {
        badPlayerIndex = Math.floor(Math.random() * gameInfo.players.length);
        let badPlayer = gameInfo.players[badPlayerIndex];
        if (!gameInfo.bads.includes(badPlayer)) {
          gameInfo.bads.push(badPlayer);
          badCount--;
        }
      }
    };

    let isbad = (playerName) => gameInfo.bads.includes(playerName);

    let chooseGoods = () => {
      gameInfo.players.forEach(p => {
        if (!gameInfo.bads.includes(p))
          gameInfo.goods.push(p);
      });
    };

    let deal = () => {
      chooseBads();
      chooseGoods();
    };
    deal();
    gameInfo.players = [];
}

const chooseCard = (color) => {
  let numbers = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
  let blacks = ["clubs", "spades"];
  let reds = ["hearts", "diamonds"];

  let chooseShape = () => Math.floor(Math.random() * 2);
  let chooseNumber = () => Math.floor(Math.random() * 13);

  if (color === "Blacks") {
    return "blacks/" + blacks[chooseShape()] + "_" + numbers[chooseNumber()];
  } else {
    return "reds/" + reds[chooseShape()] + "_" + numbers[chooseNumber()];
  }
}

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}

app.listen(process.env.PORT || 3030, () => console.log("server is up"));

module.export = {createGame: createGame};
