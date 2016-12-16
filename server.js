const http = require('http');
const express = require('express');
const socket = require('socket.io');

// function server(req, res) {
//     res.writeHead(200, { "Content-Type": "text-plain" });
//     res.write("Hello World");
//     res.end();
// }
const app = express();
const server = http.createServer(app);
const io = socket.listen(server);

app.use('/',express.static(__dirname+"/www"));
server.listen(8080);

console.log("http server is running .");
var users = []; // all users of online;

io.on('connection',function(soc){
    soc.emit('news',{hello: 'hello'});

    soc.on('login', function(nickname) {
        if(users.indexOf(nickname) > -1){
            soc.emit('user is online.')
        }else {
            soc.userIndex=users.length;
            soc.nickname = nickname;
            users.push(nickname);
            soc.emit("loginSuccess");
            io.sockets.emit('system',soc.nickname, users.length, 'login');
        }
    })

    soc.on('foo', function(data){
        console.log(data);
    });

    soc.on('postMsg', function(msg, color) {
        soc.broadcast.emit('newMsg', soc.nickname, msg, color);
    });

    soc.on('disconnect', function() {
        users.splice(soc.userIndex, 1);
        soc.broadcast.emit('system', soc.nickname, users.length, 'logout' );
    });

    soc.on('img', function(imageData){
        soc.broadcast.emit('newImg', soc.nickname, imageData);
    });
});
