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
    var chatRef = database.ref("/chat");
    var pointsRef = database.ref("/scores");

    var player;
    var otherPlayer;
    var name = [];
    var userRef;
    var pointsUserRef;
    var wins1, wins2, losses1, losses2;

    var num = 0;

    var choices = ['rock','paper','scissors'];

    // Remove turn and chat when either player disconnects
    turnRef.onDisconnect().remove(); // this call is made everytime the user is online because it fires only once
    chatRef.onDisconnect().remove();
    
    $(".title-animation").hide();

    var audio = new Audio('assets/mp3/funny_level_180_proud_music_preview.mp3');
    var smash = new Audio('assets/mp3/Sharp Punch-SoundBible.com-1947392621.mp3');
    var coin = new Audio('assets/mp3/smw_coin.wav')

    var game = {
        listenToGame: function(){
            // listens for clients added
            pointsRef.on("value", function(snapshot){

            });
            $(".search").one("click", function(){
                audio.play();
                var username = $("#username").val();
                $(".form-control").hide();
                if(username != " "){
                    $(".player-one").addClass("start-pulse");
                    game.setPlayer();
                }
            });
            playersRef.on('child_added', function(childSnapshot){
                var key = childSnapshot.key;
                name[key] = childSnapshot.val().name;
                var mainDiv = $(`.display-player${key}`);
                mainDiv.empty();
                var p = $("<p>");
                p.attr("class", "usernames");
                p.attr("id", `username${key}`);
                p.text(name[key]);
                mainDiv.append(p);

                $(`#usernameTable${key}`).text(name[key]);
            });
            // Remove player name from box on disconnect
			playersRef.on('child_removed', function(childSnapshot) {
                // Find player that was removed
                var key = childSnapshot.key;
				// Show 'player has disconnected' on chat
                chat.sendDisconnect(key);
                
                // bring back to station one
                $(".form-control").empty();
                $(".player-one").addClass("start-pulse");
                $(".player-two").addClass("start-pulse");
                $(".player1").removeClass("animate-player-one");
                $(".player2").removeClass("animate-player-two");
                $(".usernames").css("display", "none");
                $(".search").show();
                $(".floating-instructions").show();
                var cards = $(".cards");
                cards.empty();
			});
            turnRef.on("value", function(snapshot){
                var turnNum = snapshot.val(); // 1 or 2
                if(turnNum == 1) {
                    if(player == 1){
                        $(".player-two").removeClass("start-pulse");
                    }
                    else if(player == 2){
                        $(".player-two").addClass("start-pulse");
                        $(".player-one").removeClass("start-pulse");
                    }
                    $(".player1").addClass("animate-player-one");
                    $(".player2").addClass("animate-player-two");
                    $(".usernames").css("display", "block");
                    $(".search").hide();
                    $(".floating-instructions").hide();
                            
                    game.buildBoard();
                }
                else if (turnNum == 3) {
                     game.outcome();
                }
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
            var str = playerName;
            var three = str.substring(0, 3);
            var usernameUp = three.toUpperCase();
            
            // create new child with player number as the path
            userRef = playersRef.child(playerNumber); // usersRef = https://rpsgame-9749e.firebaseio.com/playersRef/1

            //pointsRef.child(playerNumber);
            // Allows for disconnect
            userRef.onDisconnect().remove(); // Ensures the data at this location is deleted when the client is disconnected
            // Sets children of player number
			userRef.set({       
				'name': usernameUp,
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
        setChoice: function(){
            num += 1;
            //$(this).toggleClass('slide-top');
            var cardsChoiceDiv = $(`.cards-choice-${player}`);
            var imgC = $("<img>");
            var choice = $(this).data("choice");
            imgC.attr("src", `assets/images/${choice}.png`)
            

            cardsChoiceDiv.html(imgC);
            smash.play();

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
				game.logic();
			});
        },
        logic: function() {
			// Logic for finding winner
			if (choice1 == choice2) {
                $(".item-winner").text("IT'Sss");
                $(".item-message").text("A...");
                $(".item-losser").text("TIE!!!");
                game.winner(0);
			} else if (choice1 == 'rock') {
				if (choice2 == 'paper') {
                    $(".item-winner").text(choice2);
                    $(".item-message").text("SMASH!!");
                    $(".item-losser").text(choice1);
                    game.winner(2);
				} else if (choice2 == 'scissors') {
                    $(".item-winner").text(choice1);
                    $(".item-message").text("SMASH!!");
                    $(".item-losser").text(choice2);
                    game.winner(1);
				}
			} else if (choice1 == 'paper') {
				if (choice2 == 'rock') {
                    $(".item-winner").text(choice1);
                    $(".item-message").text("WRAPS!!");
                    $(".item-losser").text(choice2);
                    game.winner(1);
				} else if (choice2 == 'scissors') {
                    $(".item-winner").text(choice2);
                    $(".item-message").text("CUTS!!!");
                    $(".item-losser").text(choice1);
                    game.winner(2);
				}
			} else if (choice1 == 'scissors') {
				if (choice2 == 'rock') {
                    $(".item-winner").text(choice2);
                    $(".item-message").text("SMASH!!");
                    $(".item-losser").text(choice1);
                    game.winner(2);
				} else if (choice2 == 'paper') {
                    $(".item-winner").text(choice1);
                    $(".item-message").text("CUTS!!!");
                    $(".item-losser").text(choice2);
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
                    $(`div.cards-choice-${playerNum} > img`).addClass('rotate-center');
				} else {
					wins = wins2;
                    losses = losses1;
                    $(`div.cards-choice-${playerNum} > img`).addClass('rotate-center');
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
                    coin.play();
                }, 500);
                
                // pointsRef.child(playerNum).update({
                //     'wins': wins
                // });
                // pointsRef.child(otherPlayer).update({
                //     'wins': wins
                // });
			}
            // Display results

			window.setTimeout(function() {
				// Reset turn to 1
				turnRef.set(1);
            }, 2000);
            
            $(".title-animation").show();
            $(".title").lettering();
            $(".rst").lettering();
            game.animate();
            setTimeout(function(){
                $(".title-animation").hide();
            }, 2000);
        },
        animate: function() {
            var title1 = new TimelineMax();
            title1.to(".rst", 0, {visibility: 'hidden', opacity: 0})
            title1.staggerFromTo(".title span", 0.5, 
            {ease: Back.easeOut.config(1.7), opacity: 0, bottom: -80},
            {ease: Back.easeOut.config(1.7), opacity: 1, bottom: 0}, 0.05);
        }
    }

    var chat = {
        message: " ",
        listeners: function(){
            // Send button click
            $('#sendMessage').on('click', chat.sendNewMessage);
            // Show message when received
			chatRef.on('child_added', function(childSnapshot) {
				// Get name and message
				var playerName = childSnapshot.val().name;
				var message = childSnapshot.val().message;
				// Show message
				chat.showMessage(playerName, message);
			});
        },
        // getMessage: function() {
		// 	var input = $('#message-input');
		// 	// Get message then clear it
		// 	chat.message = input.val();
		// 	input.val('');
		// 	// Send data to database if player has name
		// 	if (player !== undefined) {
		// 		chat.sendMessage();
		// 	}
        // },
        sendMessage: function() {
			var obj = {};
			obj['name'] = name[player];
			obj['message'] = chat.message;
			chatRef.push(obj);
        },
        sendDisconnect: function(key) {
			var obj = {};
			obj['name'] = name[key];
			obj['message'] = ' has disconnected.';
			chatRef.push(obj);
        },
        showMessage: function(playerName, message) {
			// Auto scroll to bottom variables
			//var messages = document.getElementById('messages');
			//var isScrolledToBottom = messages.scrollHeight - messages.clientHeight <= messages.scrollTop + 1;
            // Create p with display string
            
            var messagesContainer = $('.messages');

			var $p = $('<p>');
			if (message == ' has disconnected.' && player !== undefined) {
                messagesContainer.append([
                    '<div class="message-container">',
                    '<img class="self-image" src="assets/images/error.png"/>',
                    '<li class="self">',
                    playerName,
                    message,
                    '</li>',
                    '</div>'
                ].join(''));
			} else if (player !== undefined) {
                if (name[1] == playerName){
                    messagesContainer.append([
                        '<div class="message-container">',
                        '<img class="self-image" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/173024/jonathanlarradet_copy.png"/>',
                        '<li class="self">',
                        message,
                        '</li>',
                        '</div>'
                    ].join(''));
                }
                else if(name[2] == playerName){
                    messagesContainer.append([
                        '<div class="message-container">',
                        '<img class="self-image" src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/173024/jonathanlarradet_copy.png"/>',
                        '<li class="self">',
                        message,
                        '</li>',
                        '</div>'
                    ].join(''));
                }
                
            }

            // messagesContainer.finish().animate({
            //     scrollTop: messagesContainer.prop("scrollHeight")
            // }, 250);
        },
        sendNewMessage: function(){
            var userInput = $('.text-box');
            var newMessage = userInput.html().replace(/\<div\>|\<br.*?\>/ig, '\n').replace(/\<\/div\>/g, '').trim().replace(/\n/g, '<br>');

            if (!newMessage) return;
            chat.message = newMessage;
        
            // clean out old message
            userInput.html('');
            // focus on input
            userInput.focus();
            
            if (player !== undefined) {
            	chat.sendMessage();
            }
            else{
                $('.messages').append([
                    '<li class="self">',
                    "Hi! You'll be able to chat as soon as you search for another oponent. Once a new player has joined your messages will be avilable to read in your opponents screen",
                    '</li>'
                ].join(''));
            }
        }
    }
    
// On page load Inizialize game
game.listenToGame();
// Start chat
chat.listeners();

var instructions = $('.floating-instructions');
setTimeout(function() {
    instructions.addClass('enter');
}, 1000);

instructions.click(openInstructions);

$(".close-instructions").on("click", closeInstructions);

function openInstructions() {
    instructions.find('>i').hide();
    instructions.addClass('expand');
    instructions.find('.instructions').addClass('enter');
    instructions.off('click', openInstructions);
    instructions.find('header-inst button').click(closeInstructions);
}

function closeInstructions() {
    instructions.find('.instructions').removeClass('enter').hide();
    instructions.find('>i').show();
    instructions.removeClass('expand');
    instructions.find('header-inst button').off('click', closeInstructions);
    setTimeout(function() {
        instructions.find('.instructions').removeClass('enter').show()
        instructions.click(openInstructions);
    }, 500);
}
    
var element = $('.floating-chat');
var myStorage = localStorage;

if (!myStorage.getItem('chatID')) {
    myStorage.setItem('chatID', createUUID());
}

setTimeout(function() {
    element.addClass('enter');
}, 1000);

element.click(openElement);

function openElement() {
    var messages = element.find('.messages');
    var textInput = element.find('.text-box');
    element.find('>i').hide();
    element.addClass('expand');
    element.find('.chat').addClass('enter');
    element.off('click', openElement);
    element.find('.header button').click(closeElement);
    messages.scrollTop(messages.prop("scrollHeight"));
}

function closeElement() {
    element.find('.chat').removeClass('enter').hide();
    element.find('>i').show();
    element.removeClass('expand');
    element.find('.header button').off('click', closeElement);
    element.find('.text-box').off('keydown', onMetaAndEnter).prop("disabled", true).blur();
    setTimeout(function() {
        element.find('.chat').removeClass('enter').show()
        element.click(openElement);
    }, 500);
}

function createUUID() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
}

function onMetaAndEnter(event) {
    if ((event.metaKey || event.ctrlKey) && event.keyCode == 13) {
        sendNewMessage();
    }
}




});

