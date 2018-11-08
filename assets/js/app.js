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
    var selRef = database.ref("/sel");

    var player;
    var otherPlayer;
    var name = [];
    var userRef;
    var wins1, wins2, losses1, losses2;

    var num = 0;

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
            playersRef.on('child_added', function(childSnapshot){
                var key = childSnapshot.key;
                name.push(childSnapshot.val().name);
                $("#username1").text(name[0]);
                $("#username2").text(name[key-1]);

            });
            // Remove player name from box on disconnect
			playersRef.on('child_removed', function(childSnapshot) {
				// Find player that was removed
				//var key = childSnapshot.key();
                // bring back to station one
                $(".player-one").addClass("start-pulse");
                $(".player-two").addClass("start-pulse");
                $(".player1").removeClass("animate-player-one");
                $(".player2").removeClass("animate-player-two");
                $(".usernames").css("display", "none");
                $(".search").show();
                var cards = $(".cards");
                cards.empty();
			});
            turnRef.on("value", function(snapshot){
                var turnNum = snapshot.val(); // 1 or 2
                if(turnNum == 1) {
                    $(".player-one").removeClass("start-pulse");
                    $(".player-two").removeClass("start-pulse");
                    $(".player1").addClass("animate-player-one");
                    $(".player2").addClass("animate-player-two");
                    $(".usernames").css("display", "block");
                    $(".search").hide();
                            
                    game.buildBoard();
                    //game.turn1();
                }
                else if (turnNum == 3) {
                     game.outcome();
                }
                // else if (turnNum == 3){
				// 	game.turn3();
				// }
            });
            // Listen for change in wins and losses for players 1
			playersRef.child(1).on('child_changed', function(childSnapshot) {
				if (childSnapshot.key == 'wins') {
					wins1 = childSnapshot.val();
				} else if (childSnapshot.key == 'losses') {
					losses1 = childSnapshot.val();
				}
				// Update score display
				if (wins1 !== undefined) {
					console.log(wins + " vs losses = " + losses);
                    $(`.score1`).text(wins1);
                    $(`.record1`).text(losses1);
				}
            });
            // Listen for change in wins and losses for player 2
			playersRef.child(2).on('child_changed', function(childSnapshot) {
				if (childSnapshot.key == 'wins') {
					wins2 = childSnapshot.val();
				} else if (childSnapshot.key == 'losses') {
					losses2 = childSnapshot.val();
				}
				// Update score display
				$(`.score2`).text(wins2);
                $(`.record2`).text(losses2);
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
            var playerName = $("#username").val();

            
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
        buildBoard: function(){
            var cards = $(".cards");
            cards.empty();
            var choice1Div = $(".cards-choice-1");
            choice1Div.empty();
            var choice2Div = $(".cards-choice-2");
            choice2Div.empty();

            for(i in choices){
                var imgChoice = $("<img>");
                imgChoice.attr("src", `assets/images/${choices[i]}.png`);
                imgChoice.attr("data-choice", choices[i]);
                cards.append(imgChoice);
            }

            /* ready button */
            // var button = $(".ready-close-container");
            // var rcBtn = $("<button class='slide-fwd-center'>");
            // rcBtn.addClass("btn btn-round btn-lg btn-filled-orange");
            // rcBtn.text("VS");
            
            //button.append(rcBtn);

            console.log(player);

            $(document).one("mousedown", `.cards-container-${player} img`, game.setChoice);
           
        },
        turn1: function() {
			$('.player-one').css('border','4px solid green');
			// Show turn message
			//game.turnMessage(1);
            // Show choices to player 1
            console.log(player);
			if (player == 1) {
                // listen for choice
                $(document).one("mousedown", ".cards-container-1 img", game.setChoice);
			}
        },
        turn2: function() {
            $('.player-one').css('border','none');
            $('.player-two').css('border','4px solid green');
			// Show turn message
			//game.turnMessage(1);
            // Show choices to player 1
            console.log(player);
			if (player == 2) {
                // listen for choice

                $(document).one("mousedown", ".cards-container-2 img", game.setChoice);
			}
        },
        turn3: function() {
            $('.player-two').css('border','none');
            // Show winner
            game.winner();
		},
        setChoice: function(){
            num += 1;
            //$(this).toggleClass('slide-top');
            var cardsChoiceDiv = $(`.cards-choice-${player}`);
            var imgC = $("<img>");
            var choice = $(this).data("choice");
            imgC.attr("src", `assets/images/${choice}.png`)
            

            cardsChoiceDiv.html(imgC);

            // update selection to database
            var choice = $(this).attr('data-choice');
            userRef.update({
                'choice': choice,
            });

            // Listen for turnNum
			turnRef.once('value', function(snapshot) {
				var turnNum = snapshot.val();
				// Increment turn
				turnNum++;
				turnRef.set(turnNum);
			});
        },
        outcome: function(){
            // Get choices, wins, and losses from database
			playersRef.once('value', function(snapshot) {
				var snap1 = snapshot.val()[1];
				var snap2 = snapshot.val()[2];
				choice1 = snap1.choice;
				wins1 = snap1.wins;
				losses1 = snap1.losses;
				choice2 = snap2.choice;
				wins2 = snap2.wins;
				losses2 = snap2.losses;
				// Show other player's choice
                var textChoice = player == 1 ? choice2:choice1;
                var otherPlayer = player == 1 ? 2:1;

                var cardsChoiceDiv = $(`.cards-choice-${otherPlayer}`);

                var imgC = $("<img>");
                imgC.attr("src", `assets/images/${textChoice}.png`)

                cardsChoiceDiv.html(imgC);
				
                //$(`.cards-container-${player} img[data-choice='${textChoice}']`).addClass('slide-top');
                $(`div.cards-choice-${otherPlayer} > img`).addClass('rotate-center');


				game.logic();
			});
        },
        logic: function() {
			// Logic for finding winner
			if (choice1 == choice2) {
				game.winner(0);
			} else if (choice1 == 'rock') {
				if (choice2 == 'paper') {
					game.winner(2);
				} else if (choice2 == 'scissors') {
					game.winner(1);
				}
			} else if (choice1 == 'paper') {
				if (choice2 == 'rock') {
					game.winner(1);
				} else if (choice2 == 'scissors') {
					game.winner(2);
				}
			} else if (choice1 == 'scissors') {
				if (choice2 == 'rock') {
					game.winner(2);
				} else if (choice2 == 'paper') {
					game.winner(1);
				}
			}
        },
        winner: function(playerNum) {
			var results;
			// Display tie
			if (playerNum == 0) {
				results = 'Tie!';
			} else {
				// Display winner
				//results = name[playerNum] + ' Wins!';
				// Set wins and losses based on winner
				if (playerNum == 1) {
					wins = wins1;
					losses = losses2;
				} else {
					wins = wins2;
					losses = losses1;
				}
				// Incremement win and loss
				wins++;
				losses++;
				// Gray loser
				var otherPlayerNum = playerNum == 1 ? 2:1;
				//$('.choices' + otherPlayerNum + ' > i').css('opacity','0.5');
				window.setTimeout(function() {
					// Set the wins and losses
					playersRef.child(playerNum).update({
						'wins': wins
					});
					playersRef.child(otherPlayerNum).update({
						'losses': losses
					});
				}, 500);
			}
            // Display results

			window.setTimeout(function() {
				// Reset turn to 1
				turnRef.set(1);
			}, 2000);
		}
    }
    
    // On page load Inizialize game
    game.listenToGame();
});

