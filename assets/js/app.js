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
    var connectionsRef = database.ref("/connections");

    // '.info/connected' is a special location provided by Firebase that is updated
    // every time the client's connection state changes.
    // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
    var connectedRef = database.ref(".info/connected");

    var player1 = {
        number: '0',
        name: 'Andres',
        wins: 0,
        losses: 0,
        turns: 0,
        choice: ''
    };

    var player2 = {
        number: '0',
        name: 'Bob',
        wins: 0,
        losses: 0,
        turns: 0,
        choice: ''
    };


    $(".search").on("click", function(){
        $(".player-one").addClass("start-pulse");
    });
});

