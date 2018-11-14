var express = require('express');
var path = require('path');
var md5 = require('md5');

var app = express();

const APP_PORT = 3030;
const server = app.listen(APP_PORT, () => {
  console.log(`App running on port ${APP_PORT}`);
})

/*
 * <var dbUrl = '';
 *
 * mongo.connect(dbUrl, (err) => {
 *   console.log("mongodb connected, Err:", err);
 * })
 *
 *
 * var Message = mongo.model("Message", {
 *   id: String,
 *   message: String
 * });
 *
 */

var io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.get('/', (req, res) => {
  res.render('index');
})

const users = {};

/* New connection */
io.on('connection', (socket) => {
  var user = false;

  // Console.log('A user connected')

  for (var nb in users) {
    socket.emit('newusr', users[nb]);
  }

  /* Login Form*/
  socket.on('newlogin', (credentials) => {
    user = credentials;
    user.img = 'https://gravatar.com/avatar/' + md5(user.mail) + '?s=80';
    user.id = user.mail.replace('@', '-').replace('.', '-');
    if (users[user.id]) {
      socket.emit('sameusr');
    }
    users[user.id] = user;
    socket.emit('logged');
    io.emit('newusr', user);
  })

  /* Messaging */
  socket.on('newmsg', (message) => {
    user.lastMsg = message;
    // Console.log(`NewMsg: ${user.lastMsg} | ID: ${user.id}`);
    io.emit('newmsg', user);
  })

  /* Disconnection */
  socket.on('disconnect', () => {
    if (!user) {
      return false;
    }
    delete users[user.id];
    io.emit('usrdisc', user);
  })
})