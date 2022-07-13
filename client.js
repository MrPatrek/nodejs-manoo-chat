




// Function for the work with the data on the website
$(function () {
  // Turn on socket.io and follow all of the connections
  var socket = io.connect();

  // Each of the below VAR's represent a "reference" to a DIV block in pchat.html page
  var $block1 = $("#block1"); // block1 div
  var $block2 = $("#block2"); // block1 div

  var $usernameForm = $("#usernameForm"); // form for username
  var $usernameField = $("#usernameField"); // field for entering the username

  var $messageForm = $("#messageForm"); // form for messaging
  var $messageField = $("#messageField"); // text field for messaging

  var $all_messages = $("#all_messages"); // block where all messages are stored


  $block2.hide(); // hide the messaging block initially
  $('input').attr('autocomplete', 'off'); // Simply disable autocomplete (don't save what you type in the textfield)






  // Function which is executed when we press submit button of the form "usernameForm"
  // We accept the username and hide the block1
  $usernameForm.submit(function (event) {
    event.preventDefault(); // disable page reloading
    socket.emit('send username', { username: $usernameField.val() }); // we create an event where we send our username

    $messageField.val(''); // clear the field with old message
    $block1.hide(); // we hide the DIV where we enter our username
    $block2.show(); // and show the block where we have chat window
  });



  // Function which executes when we press submit button of the form "messageForm"
  // We send our message to the server
  $messageForm.submit(function (event) {

    event.preventDefault(); // we disable page reloading
    // В сокет отсылаем новое событие 'send message',
    // We send the data like message, username and the Bootstrap class (BG color of particular message)
    socket.emit('send message', { message: $messageField.val(), username: $usernameField.val(), className: 'primary' }); // VAL ПОТОМУ, ЧТО ЭТО ИНПУТ !

    $messageField.val(''); // clear the mesage field

    // Auto-scroll down when submitting
    $('html, body').scrollTop($('html, body').height());

  });







  // Here we are listening to an event 'append message' from the server
  socket.on('append message', function (data) {

    var currentDate = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // current time

    // We append received message in the block with other messages
    $all_messages.append("<div class='message alert-" + data.className + "'>	<!--	one particlular message	--><p><b>" + data.username + "</b>: " + data.message + "</p>	<!--	his message	--> <span class='time-right'>" + currentDate + "</span>  	</div>");

    // We send old chat to the server (so that the history is saved)
    socket.emit('send history', { history: $all_messages.html() });

    // Auto-scroll down
    $('html, body').scrollTop($('html, body').height());

  });





  // We restore history of the chat here
  socket.on('restore hisory', function (data) {

    $all_messages.empty(); // Remove the previous contents of the messages block
    $all_messages.append(data.history); // And append a new one from the server

    // Auto-scroll down
    $('html, body').scrollTop($('html, body').height());

  });

});
