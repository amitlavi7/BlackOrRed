var numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
var blacks = ["clubs", "spades"];
var reds = ["hearts", "diamonds"];

var chooseShape = () => Math.floor(Math.random() * 2);
var chooseNumber = () => Math.floor(Math.random() * 14);

class Card {
  constructor(color){
    if(color === "black")
      this.shape = blacks[chooseShape()];
    else
      this.shape = reds[chooseShape()];
    this.number = numbers[chooseNumber()];
  }
}
