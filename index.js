const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs'); //maybe 'app.use'

app.use(express.static('public')); //for static files
app.use(bodyParser.urlencoded({
  extended: true
}));

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
    response.sendFile(__dirname + '/player.html');
    app.post(groupURL, (req, res) => {
      let playerName = req.body.playerName;
      let playerURL = groupURL + "/" + playerName;
      // var card = "";
      players.push(playerName);
      createGame(numOfPlayers);
      res.redirect(playerURL);

      app.get(playerURL, (req, res) => {
        res.write("<h1>" + playerName + "</h1>");
        if (reds.includes(playerName)){
          chooseCard("red");
          res.write("<h3>you are red!</h3>");
          // card = "red";
          res.write('<img class="card" src="https://cdn2.bigcommerce.com/n-d57o0b/1kujmu/products/297/images/933/KH__01216.1440113580.1280.1280.png?c=2" alt="You Are Red!">');
          // res.sendFile(__dirname + "/redCard.html");
        }
        else if (blacks.includes(playerName)){
          chooseCard("black");
          res.write("<h3>you are black!</h3>");
          // card = "Red";
          res.write('<img class="card" src="https://cdn2.bigcommerce.com/n-d57o0b/1kujmu/products/297/images/935/AS__68652.1440113599.1280.1280.png?c=2" alt="You Are Black!">');
          // res.sendFile(__dirname + "/blackCard.html");
        }
        // response.sendFile(__dirname + '/card.html');
        // res.render('card', {card: card})
        // res.write("red is: " + reds + ", blacks are: " + blacks);
        // res.write(", players are: " + players);

        if(numOfPlayers === players.length)
          res.write("<h2>All players has been logged in, please refresh to start</h2>");
        // while(numOfPlayers !== players.length){
        //   setTimeout(function () {
        //     res.redirect('back');
        //   }, 5000);
        // }

        res.send();
      });
    });
  });
});

const createGame = (numOfPlayers) => {
  blacks = [];
  reds = [];
  if(numOfPlayers === players.length){
    let numOfReds = 0;
    if(numOfPlayers < 6)
      numOfReds = 1;
    else if(numOfPlayers < 8)
      numOfReds = 2;
    else
      numOfReds = 3;

    var chooseReds = () => {
      let redPlayerIndex;
      while (numOfReds > 0) {
        redPlayerIndex = Math.floor(Math.random() * players.length);
        let redPlayer = players[redPlayerIndex];
        if (!reds.includes(redPlayer)){
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

  if(color === "black"){
    card = "blacks/" + blacks[chooseShape()] + "_" + numbers[chooseNumber()];
  } else {
    card = "reds/" + reds[chooseShape()] + "_" + numbers[chooseNumber()];
  }
}

// function updateTextInput(val) {
//   document.getElementById('textInput').value = val;
// }


app.listen(process.env.PORT || 3030, () => console.log("server is up"));

// app.listen(3030, () => console.log("server is up on port 3030"));
