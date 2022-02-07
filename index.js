console.log("The Tarot Bot is begining the reading...");

//making sure npm run develop works
if (process.env.NODE_ENV === "develop") {
    require("dotenv").config();
};

// Rules for the node-schedule
let schedule = require("node-schedule");
let rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = 3,
    rule.hour = 8;
    rule.tz = "Etc/GMT+4";
//



// The Complete Tarot Deck
function tarotReading() {
    let tarotDeck = [];

    let majArcana = ["The World", "Judgement", "The Sun", "The Moon", "The Star", "The Tower", "The Devil", "Temperance", "Death", "The Hanged Man", "Justice", "The Wheel of Fortune", "The Hermit", "Strength", "The Chariot", "The Lovers", "The Hierophant", "The Emperor", "The Empress", "The High Priestess", "The Magician", "The Fool"];

    //let tarotDeckLength = tarotDeck[1];
    //console.log(tarotDeck.indexOf("The Empress"));
    let minArcana = [];


    let suitWands = ["King of Pentacles","Queen of Pentacles","Knight of Pentacles","Page of Pentacles","Ten of Pentacles","Nine of Pentacles","Eight of Pentacles","Seven of Pentacles","Six of Pentacles","Five of Pentacles","Four of Pentacles","Three of Pentacles","Two of Pentacles","Ace of Pentacles"];
    let suitCups = ["King of Cups","Queen of Cups","Knight of Cups","Page of Cups","Ten of Cups","Nine of Cups","Eight of Cups","Seven of Cups","Six of Cups","Five of Cups","Four of Cups","Three of Cups","Two of Cups","Ace of Cups"];
    let suitSwords = ["King of Swords","Knight of Swords","Queen of Swords","Page of Swords","Ten of Swords","Nine of Swords","Eight of Swords","Seven of Swords","Six of Swords","Five of Swords","Three of Swords","Four of Swords","Two of Swords","Ace of Swords"];
    let suitPentacles = ["King of Pentacles","Queen of Pentacles","Knight of Pentacles","Page of Pentacles","Ten of Pentacles","Nine of Pentacles","Eight of Pentacles","Seven of Pentacles","Six of Pentacles","Five of Pentacles","Four of Pentacles","Three of Pentacles","Two of Pentacles","Ace of Pentacles"];

    minArcana = suitWands.concat(suitCups,suitSwords,suitPentacles);
    tarotDeck = majArcana.concat(minArcana);


    //crypto generator
    let genCrypto = new Uint32Array(78);
    require('crypto').webcrypto.getRandomValues(genCrypto);

    let genNums = [];
    let cardCharge = [];
    for (let i = 0; i < 3; i++) {
        genNums[i] = genCrypto[i];
    if (genNums[i] % 2 == 0) {
        //console.log("even")
        cardCharge[i] = "Upright";
    }
    else {
        //console.log("odd");
        cardCharge[i] = "Reversed";

    }
    }

    // Reverse-card chance
        

    // Here the crypto numbers are ordered. Least to greatest. 
    let orderedCryptoNums = genCrypto.sort();

    let cardsChoosen = [];
    for (let i = 0; i < 3; i++) {
        cardsChoosen[i] = orderedCryptoNums.indexOf(genNums[i]);
    }

    let cardReading = tarotDeck[cardsChoosen[0]] + " : " + cardCharge[0] + "\n" + tarotDeck[cardsChoosen[1]] + " : " + cardCharge[1] + "\n" + tarotDeck[cardsChoosen[2]] + " : " + cardCharge[2];

    return cardReading;
    //console.log("Here is your future: ");
    //console.log(cardReading);
}


//console.log(tarotDeck[cardsChoosen[0]] + " : " + cardCharge[0],tarotDeck[cardsChoosen[1]] + " : " + cardCharge[1],tarotDeck[cardsChoosen[2]] + " : " + cardCharge[2]);

// Create a Twitter object to connect to Twitter API
let Twit = require('twit');

// Pulling keys from another file
var T = new Twit({
    consumer_key:         'GrKMF4jnl3LtWoSFcWGMes0GJ',
    consumer_secret:      'hlC693jh4j8aUYhwuehxgud67hOtbDyQeHXJC077fTcKyp1kvj',
    access_token:         '1489436033188081669-cdaeXGc3wgc2dy3V41OXNbI6YlQz8J',
    access_token_secret:  'lBcvNmd9enCElSy6dfOxiVHwu6xsBCvApweLXtqwibEyR',
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  })
// Setting up a user stream
let stream = T.stream('statuses/filter', { track: '@the_tarot_bot' });

// Now Looking for tweet events
stream.on('tweet', pressStart);

function pressStart(tweet) {
    let id = tweet.id_str;
    let text = tweet.text;
    let name = tweet.user.screen_name;

    let regex = /(show me)/gi;

    let playerOne = text.match(regex) || [];
    let playerTwo = playerOne.length > 0;
    
    // This will help with errors, so you can see if the regex matched and if playerTwo is true or false
    console.log(playerOne);
    console.log(playerTwo);


    // checks text of tweet for mention of The_tarot_bot
    if (text.includes('@the_tarot_bot') && playerTwo === true) {
        
        // Starts reply back to sender
        let replyText =("@" + name + " Your future is revealed!\n" + tarotReading());

        // Post that tweet
        T.post('statuses/update' , { status: replyText, in_reply_to_status_id: id }, gameOver);

    } else {
        console.log("They didn't use the magic word!");
    };

    function gameOver(err, reply) {
        if (err) {
            console.log(err.message);
            console.log("Reading Over");
        } else {
            console.log('Tweeted: ' + reply.text);
        }
    };
}

function pressSelect() {

    let weeklyReplyText = "Today's Tarot reading is:\n" + cardReading;
    T.post('statuses/update', { status: weeklyReplyText }, gameOver2);

    function gameOver2(err, reply) {
        if (err) {
            console.log(err.message);
            console.log("Reading Over");
        } else {
            console.log('Tweeted: ' + reply.text);
        }
    }
}

const job1 = schedule.scheduleJob(rule, pressSelect);

job1.on("Every Day Tweet", pressSelect);