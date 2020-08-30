const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('public')); //for static files
app.use(bodyParser.urlencoded({
  extended: true
}));

var players = [];
var reds = [];
var blacks = [];

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));
app.post('/', (req, res) => {
  var groupName = req.body.groupName;
  var numOfPlayers = Number(req.body.numOfPlayers);
  var groupURL = "/" + groupName;

  //move to group page
  res.redirect(groupURL);

  app.get(groupURL, (request, response) => {

    //move to player page
    response.sendFile(__dirname + '/player.html');
    app.post(groupURL, (req, res) => {
      var playerName = req.body.playerName;
      var playerURL = groupURL + "/" + playerName;
      players.push(playerName);
      createGame(numOfPlayers);
      res.redirect(playerURL);
      app.get(playerURL, (req, res) => {
        res.write("<h1>" + playerName + "</h1>");
        // res.write("<h1>players.length: " + players.length + "</h1>");
        // res.write("<h1>numOfPlayers: " + numOfPlayers + "</h1>");
        // res.write("<h1>numOfReds: " + numOfReds + "</h1>");
        if (reds.includes(playerName)){
          // res.write("<h3>you are red!</h3>");
          res.write('<img class="card" src="https://cdn2.bigcommerce.com/n-d57o0b/1kujmu/products/297/images/933/KH__01216.1440113580.1280.1280.png?c=2" alt="You Are Red!">');
          // res.sendFile(__dirname + "/redCard.html");
        }
        else if (blacks.includes(playerName)){
          // res.write("<h3>you are black!</h3>");
          res.write('<img class="card" src="https://cdn2.bigcommerce.com/n-d57o0b/1kujmu/products/297/images/935/AS__68652.1440113599.1280.1280.png?c=2" alt="You Are Black!">');
          // res.sendFile(__dirname + "/blackCard.html");
        }
        res.write("red is: " + reds + ", blacks are: " + blacks);
        res.write(", players are: " + players);

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
  if(numOfPlayers === players.length){
    blacks = [];
    red = [];
    var numOfReds = 0;
    if(numOfPlayers < 6)
      numOfReds = 1;
    else if(numOfPlayers < 8)
      numOfReds = 2;
    else
      numOfReds = 3;

    var chooseReds = () => {
      var redPlayerIndex;
      while (numOfReds > 0) {
        redPlayerIndex = Math.floor(Math.random() * players.length);
        reds.push(players[redPlayerIndex]);
        numOfReds--;
      }
    };

    var isRed = (playerName) => reds.includes(playerName);

    var chooseBlacks = () => {
      players.forEach(p => {
        if (!reds.includes(p))
          blacks.push(p);
      });
    };

    var deal = () => {
      chooseReds();
      chooseBlacks();
      // reds.forEach(p => card("red"));
      // blacks.forEach(p => card("black"));
    };
    deal();
  }
}

// function updateTextInput(val) {
//   document.getElementById('textInput').value = val;
// }


app.listen(process.env.PORT || 3030, () => console.log("server is up"));

// app.listen(3030, () => console.log("server is up on port 3030"));
