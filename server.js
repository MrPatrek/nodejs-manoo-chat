// Connecting all the modules to the program
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Listenig to the port 8080
server.listen(8080);




// Following url adress and displaying the required file (HTML page, CSS file, JS file...)
// Client sends a request, and the server sends a response
app.get('/', function (request, response) {
	response.sendFile(__dirname + '/index.html'); // __dirname means refering to the location where script is executed
});

let links = ['/client.js', '/styles/styles.css', '/index.html', '/pchat.html',
	'/about.html', '/sitemap.html', '/images/logo/manoo.ico', '/images/logo/manoo.png'];

function appGet(link) {
	app.get(link, function (request, response) {
		response.sendFile(__dirname + link);
	});
}

links.forEach(appGet);






var counter = 0; // counting the num of online users
var history; // here the old history will be stored

// Function that will work when someone connects to the page
// Considered as a new user
io.sockets.on('connection', function (socket) {

	console.log("Successful connection");
	counter++; // +1 user online
	console.log("Users online:" + counter);


	if (counter != 1 || counter != 2)
		io.sockets.emit('append message', { message: counter + " users online! Server will NOT transmit messages until there are only two left.", username: "SERVER", className: 'danger' });


	// Function that exectes when we leave the page
	socket.on('disconnect', function (data) {

		console.log("User disconnected");
		counter--; // -1 user online
		console.log("Users online:" + counter);

		// When someone leaves the page, the server send a notification to online users about it
		if (counter == 1)
			io.sockets.emit('append message', { message: "1 user online. Please, wait for another person to enter the chat!", username: "SERVER", className: 'warning' });

		// Only if counter == 2, the messaging is possible
		else if (counter == 2)
			io.sockets.emit('append message', { message: "2 users online. You may continue the chatting!", username: "SERVER", className: 'success' });

		else
			io.sockets.emit('append message', { message: counter + " users online! Server will NOT transmit messages until there are only two left.", username: "SERVER", className: 'danger' });
	});




	// Listening to the event 'send username' from the client
	socket.on('send username', function (data) {

		// if there is only one user online
		if (counter == 1)
			//io.sockets.emit('restore hisory', { history: history }); // WE CAN SAVE HISTORY EVEN IF ALL LEFT THE CHAT

			// append a new message for all the users
			io.sockets.emit('append message', { message: data.username + " joined the chat! Wait for another person to join!", username: "SERVER", className: 'warning' })

		// if there are 2 users online
		else if (counter == 2) {
			// Restore the history for the second user
			io.sockets.emit('restore hisory', { history: history });

			// append a new message for all the users
			io.sockets.emit('append message', { message: data.username + " joined the chat! Now there are 2 users online, so you may begin the chatting!", username: "SERVER", className: 'success' });
		}

	});



	// Function receving some message from some user
	socket.on('send message', function (data) {
		// Inside the funcion we send an event 'append message' which will be called for all users and they will have a new message

		if (counter == 2)
			io.sockets.emit('append message', { message: data.message, username: data.username, className: data.className });

		else if (counter == 1)
			io.sockets.emit('append message', { message: "Don't type anything! Please, wait for another person to enter the chat!", username: "SERVER", className: 'warning' });
		else
			io.sockets.emit('append message', { message: "Oops, it seems that there are more than two participants in chat, so the message will NOT be sent until there are only two participants.", username: "SERVER", className: 'danger' });
	});



	// Listenig to an event 'send history'
	socket.on('send history', function (data) {

		history = data.history;
		console.log("History saved! ");

	});

});
