qs = require("querystring")
const express = require("express")
const app = express()
const cors = require('cors')
const assert = require("assert")
const path = require("path")
// ===========Socket Setup============
const http = require("http")
const socketio = require("socket.io")
const server = http.createServer(app)
const mongoose = require('mongoose')
const io = socketio(server)
const { addUser, deleteUserFromChatList, getUser, getLoginsInChat } = require('./src/chat/chatController')
// const chatRoutes = require("./src/chat/chatRoutes")
// app.use(chatRoutes)
// ==================================
const morgan = require("morgan")
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, './.env') })
const bodyParser = require("body-parser")
const chatRoutes = require('./src/chat/chatRoutes')

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan("dev"))
app.use('/chat', chatRoutes)

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

mongoose
  .connect("mongodb://127.0.0.1:27042/my_irc", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB CONNECTION FAIL :", err))
  
io.on('connect', (socket) => {
  console.log('User is connected')
  socket.on('join', ({ login, chat }, callback) => {
    console.log(`${login} has joined chat room "${chat}"`)
    const { error, user } = addUser({ id: socket.id, login, chat })
    if (error) return callback({ error }) //if addUser find an error, we return and stop the function
    console.log('======user created======', user)
    socket.emit('message', { user: 'admin', text: `${user.login}, welcome to the room ${user.chat}` })
    socket.broadcast.to(user.chat).emit('message', { user: 'admin', text: `${user.login} has joined` }) //broadcast sends a message to everyone in the room except the user
    socket.join(user.chat)
    io.emit('chatData', { chat: user.chat, users: getLoginsInChat(user.chat) })
    callback() //so we can work after in react
  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)
    // console.log(user, socket.id, '====message sent0=====', message)
    // console.log(user, user[0], user[0].login, socket.id, '====message sent=====', message)
    io.emit(user.chat).emit('message', { user: user[0].login, text: message })
    io.emit('chatData', { chat: user.chat, users: getLoginsInChat(user[0].chat) })
    callback() //so we can work after in react
  })

  socket.on('disconnect', function () {
    console.log('Got disconnected!', socket.request.headers.referer);

    let str = socket.request.headers.referer
    const chatLeft = str.split('/').reverse()[0].split('=').reverse()[0]
    // const user = getUser(socket.id)
    console.log('===LIST OF USER CONNECTED BEFORE LEAVING', getLoginsInChat(chatLeft)[0], chatLeft)
    //faire array avec key nom du channel
    const users = deleteUserFromChatList(socket.id)
    io.emit('chatData', { chat: chatLeft, users: users })
    console.log('===LIST OF USER CONNECTED AFTER LEAVING', users)
    // console.log('====LIST+++++', users);
    // var i = allClients.indexOf(socket);
    // allClients.splice(i, 1);
  });
  // socket.on('disconnect', (alldata) => {
  //   console.log(`User has left chat room because of ${alldata} (automatic message)`)
  // })

  // socket.on('deleteUserFromChatList', ({ login, chat }) => {
  //   console.log(`${login} has left "${chat}" room`)
  // })


})

server.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log(`Running on port ${process.env.PORT} - ${process.env.NODE_ENV}`)
})