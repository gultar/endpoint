
let lines = [];

let hexText = '';
let hexTitle = '';
let firstTime = true;
//All the necessary tools to cast an I-Ching hexagram. Need to implement yarrow method
class Hexagram{
  constructor(){
    this.sixlines = [];
    this.bottomTrigramNumber = 0;
    this.topTrigramNumber = 0;
    this.hexagramNumber = 0;
    this.title = '';
    this.text = '';
    this.changingLines = [];
  }

  //Flips a coin
  randomcoin() {
  /*  let side = (Math.random() < 0.5);*/
    var d=new Date();
    var side=Math.floor(((d.getMilliseconds()+d.getSeconds()+d.getMinutes()+d.getHours())*Math.random()) %2); //This is much closer to a random generator
    console.log(side);
    return (side);
  }

  //Casts a line using three coins method
  useThreeCoins(){
    let threeCoins = 0; //6 - 7 - 8 - 9
    let coinValue = 0;

    for(let i=0; i < 3; i++){
      if(this.randomcoin()){
        coinValue = 3; //----Yang Value----
      }
      else{
        coinValue = 2; //----Yin Value----
      }

      threeCoins += coinValue;
    }
    return threeCoins;
  }

  //Casts all six lines of the hexagram at once
  castSixLines(){
    for(let j=0; j < 6; j++){
      this.sixlines.push(this.useThreeCoins());
    }
  }

  //Casts a single line
  castALine(custom=false){ //to refactor
    if(lines.length < 6){
      lines.push(this.useThreeCoins());
    }
    else{
      this.sixlines = lines;
      console.log(this.sixlines);
    }
  }

  //Gives a text value to manually draw the hexagram figure. To be tested again
  drawLine(lineValue){
    var lineDrawn = "";
    switch(lineValue){
      case 6:
        lineDrawn = "-------&nbsp&nbsp&nbsp------- * ";
        break;
      case 7:
        lineDrawn = "----------------- ";
        break;
      case 8:
        lineDrawn = "-------&nbsp&nbsp&nbsp------- ";
        break;
      case 9:
        lineDrawn = "----------------- * ";
        break;
    }

    return lineDrawn;
  }

  //Isolates the trigram number using the three bottom and top line values to lookup the Hex number
  getTrigrams(sixlines){
    var trigramNbs = [ //--- All the possible trigrams
      "111",
      "100",
      "010",
      "001",
      "000",
      "011",
      "101",
      "110"
    ];
    let trigrams = "";
    let bottomTrigram = "";
    let topTrigram = "";
    let twoTrigramNumbers = [];
    let lines = sixlines;
    for(let i=0; i<6; i++){ //--- Formats the current trigram values into '1's and '0's
      if(this.sixlines[i]%2 !== 0){
        trigrams += "1";
      }
      else{
        trigrams += "0";
      }
    }

    bottomTrigram = trigrams.substring(0, 3);
    topTrigram = trigrams.substring(3, 6);

    twoTrigramNumbers = [trigramNbs.indexOf(bottomTrigram), trigramNbs.indexOf(topTrigram)];
    return twoTrigramNumbers;
  }

  setCustomLinesFromHexNumber(){

  }

  getChangingHex(){
    this.changinglines = this.sixlines;
    for(let i=0; i< this.sixlines.length; i++){
      switch(this.sixlines[i]){
        case 6:
          this.changingLines[i] = 7;
          break;
        case 9:
          this.changingLines[i] = 8;
          break;
        case 7:
        case 8:
          break;
      }
    }
  }

  //Looks up the hexagram number using the two trigrams. The order of trigram in the chart is by the order of King Wen's version
  getHexagramNumber(){
    let twoTrigramNumbers = this.getTrigrams();
    let bottomTrigramNb = twoTrigramNumbers[0];
    let topTrigramNb = twoTrigramNumbers[1];

    console.log("Bottom "+bottomTrigramNb);
    console.log("Top "+topTrigramNb);
    //First dimension = Bottom Trigram --- Second Dimension = Top Trigram
    var ichingHexagramTable = [ //--- Hexagram lookup table - King Wen's trigram order is used
      [1, 34, 5, 26, 11, 9, 14, 43],
      [25, 51, 3, 27, 24, 42, 21, 17],
      [6, 40, 29, 4, 7, 59, 64, 47],
      [33, 62, 39, 52, 15, 53, 56, 31],
      [12, 16, 8, 23, 2, 20, 35, 45],
      [44, 32, 48, 18, 46, 57, 50, 28],
      [13, 55, 63, 22, 36, 37, 30, 49],
      [10, 54, 60, 41, 19, 61, 39, 58]
    ];
    return ichingHexagramTable[bottomTrigramNb][topTrigramNb];
  }

  setTextAndTitle(){
      this.title = hexTitle;
      this.text = hexText;
  }
}




//Configures the firebase DB and fetches the corresponding hexagram text
function fetchHexFromFireBase(hexNumber, config=''){
    var appName = ('app-'+hexNumber).toString();

    if(!config){
      config = '54737be9255054376f9fb731b344f245e917ec5ea8a72d9f63d5671378dd915bdc462cd709515cbe'+
      'a6da84d32eb9d8e611353f377bdf0e16b1d2ec0fa0e5aa684c419d66a836a99851e2649c578afb66'+
      'aad7fef9bcea500ca063884448a575ad9bafcad00bcb93ec5ee152af6669352605bca8b216207aff'+
      '22fed3432757b96dc0621e6063e7d10ea365ff0e28b00da5ffe5e60163586967e786efe2134bc5c5'+
      'c8a58b136950875eff84f1422dfb31f929b7c876789924792ddcc9bd4bc9acbbb6bc11a09a0c1e05'+
      '5a9a7a8e03c22e77ee5e5556fb2a150879882758f86e6a050e443a073730d99508ced3c9f98fd330'+
      'de210477be7e6e4f24a7514aa4'
    }
    /*
      Had to remode google api key
    	Check terminal_app for it
    */


  if(firstTime){
    appName = '[DEFAULT]';
    firstTime = false;
  }
  firebase.initializeApp(config, appName);

    var hexNumberIndex = hexNumber - 1;

    const database = firebase.database().ref();
    console.log(database.child('posts').child(hexNumberIndex));

    const posts = database.child('posts').child(hexNumberIndex).once('value', function(snap){

      hexTitle = snap.val().title;
      hexText = snap.val().text;

      $('output').append(hexTitle);
      $('output').append(hexText);
    });
  }
