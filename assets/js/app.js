$(document).ready(function(){

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyA4W6O7hWEn2HjhtMXNfS9cQhUWOzDHczw",
        authDomain: "rpsgame-9749e.firebaseapp.com",
        databaseURL: "https://rpsgame-9749e.firebaseio.com",
        projectId: "rpsgame-9749e",
        storageBucket: "rpsgame-9749e.appspot.com",
        messagingSenderId: "474269940320"
    };
    firebase.initializeApp(config);

    // Create a variable to reference the database.
    var database = firebase.database();

    // connectionsRef references a specific location in our database.
    // All of our connections will be stored in this directory.
    var connections = database.ref("/connections");
    var playersRef = database.ref("/playersRef");
    var turnRef = database.ref("/turn");

    var player;
    var otherPlayer;
    var name = {};
    var userRef;
    var wins1, wins2, losses1, losses2;

    var choices = ['rock','paper','scissors'];

    // Remove turn and chat when either player disconnects
	turnRef.onDisconnect().remove(); // this call is made everytime the user is online because it fires only once

    var game = {
        listenToGame: function(){
            // listens for clients added
            database.ref().on("value", function(snapshot){

            });
            $(".search").one("click", function(){
                $(".player-one").addClass("start-pulse");
                game.setPlayer();
            });
            turnRef.on("value", function(snapshot){
                var turnNum = snapshot.val(); // 1 or 2
                if(turnNum == 1) {
                    $(".player-one").removeClass("start-pulse");
                    $(".player-two").removeClass("start-pulse");
                    $(".player1").addClass("animate-player-one");
                    $(".player2").addClass("animate-player-two");
                    $(".usernames").css("display", "block");
                    //$("#username1").text()
                    game.turn1();
                }
                else if (turnNum == 2){
                    game.turn2();
                }
                else if (turnNum == 3){
                    game.turn3();
                }
            });
        },
        setPlayer: function(){
            database.ref().once("value", function(snapshot){
                var playerObj = snapshot.child("playersRef"); // creating new child named payersRef
                var numOfPLayers = playerObj.numChildren();
                if(numOfPLayers == 0){
                    player = 1;
                    game.addPlayer(player);
                }
                else if(numOfPLayers == 1){
                    player = 2;
                    game.addPlayer(player);
                    turnRef.set(1);
                }
            })
        },
        addPlayer: function(playerNumber){
            // get player name from user input
            var playerName = 'Andres';
            // create new child with player number as the path
            userRef = playersRef.child(playerNumber); // usersRef = https://rpsgame-9749e.firebaseio.com/playersRef/1
            // Allows for disconnect
            userRef.onDisconnect().remove(); // Ensures the data at this location is deleted when the client is disconnected
            // Sets children of player number
			userRef.set({
				'name': playerName,
				'wins': 0,
				'losses': 0
			});
        },
        turn1: function(){
            $(".player-one").css("border", "4px solid green");
        }
    }
    
    // On page load Inizialize game
    game.listenToGame();
});

