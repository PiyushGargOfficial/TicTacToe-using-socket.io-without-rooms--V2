const express = require('express');
const app = express();
const socket = require('socket.io');

const PORT = process.env.PORT || 9000;

app.use(express.static('public'));

app.use((req, res, next) => {
    res.send("OOPS! You typed something wrong!");
});

var server = app.listen(PORT, () => {
    console.log("Server Started...");
});

var io = socket(server);
io.sockets.on('connection', function (socket) {
    // console.log('Connection : ', socket.request.connection.__peername); //gives us the name of the user connected.
    //whatever message we are emiting here the server side picks the data by data.message.
    socket.on('id', function (data) {
        io.sockets.emit('print', data); //from above emit.
    });
    socket.on("saved", (number) => {
        socket.emit("changes", number);
    });
});