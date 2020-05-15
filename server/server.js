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
const { addUser, deleteUserFromChatList, getUser, getLoginsInChat,
  changeChatName, getChats, verifyChatPassword, createChat,
  deleteChat } = require('./src/chat/chatController')
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
  console.log('\n\nconnect Begin_________________________________________________________________')
  console.log('User is connected')
  io.emit('getChatList', getChats())
  console.log('\n\n\n')
  socket.on('verifyChatPassword', ({ adminpw, chat }, callback) => callback(verifyChatPassword({ adminpw, chat })))
  socket.on('doesUserExist',
    function (data, fn) {
      console.log('\n\ndoesUserExist Begin_________________________________________________________________')
      const { login, chat } = data
      console.table([data, login, chat])
      usersInChat = getLoginsInChat(chat)
      console.table(usersInChat)
      if (usersInChat == false) {
        fn(true)
      }
      else if ((usersInChat && usersInChat.includes(login))) {
        fn(false)
      }
      else {
        fn(true)
      }
      console.log('doesUserExist End___________________________________________________________________')
    }
  );

  //CHAT CRUD ===================
  socket.on('createNewChat', ({ chat, password }, callback) => {
    if (createChat({ password, chat })) { // if true, chat exists, return error
      callback({ error: 'Chat already exists' })
    }
    callback({ message: 'OK' })
  })

  socket.on('deleteChat', ({ chat }, callback) => {
    if (deleteChat({ chat })) callback(true) //error
    else io.emit('redirectToIndex', {oldChat:chat}) //success
  })
  //CHAT CRUD ===================

  socket.on('join', ({ login, chat }, callback) => {
    console.log('\n\njoin Begin___________________________________________________________________')
    console.log('socket.on(JOIN)', [`${login} has joined chat room "${chat}"`])
    const { error, user } = addUser({ id: socket.id, login, chat })
    if (error) return callback({ error }) //if addUser find an error, we return and stop the function
    socket.login = login
    socket.chat = chat
    console.log('======user created======', user, '=========sending msg to user connected==========')
    socket.emit('message', { chatName: chat, user: 'admin', text: `${user.login}, welcome to the room ${chat}` })
    socket.broadcast.to(chat).emit('message', { chatName: chat, user: 'admin', text: `${user.login} has joined` }) //broadcast sends a message to everyone in the room except the user
    socket.join(chat)
    io.emit('chatData', { chat: chat, users: getLoginsInChat(chat) })
    callback() //so we can work after in react
    console.log('join End_____________________________________________________________________')
  })

  socket.on('sendMessage', (message, callback) => {
    console.log('\n\nsendMessage Begin___________________________________________________________________')
    console.log('======receiving message', message)
    let str = socket.request.headers.referer
    const chat = str.split('/').reverse()[0].split('=').reverse()[0]
    console.log('socketid et chat', socket.id, chat)
    const user = getUser(socket.id, chat)
    console.log('===SENDMESSAGE===', user, user[0], user[0].login, chat, message)
    io.emit('message', { chatName: chat, user: user[0].login, text: message })
    io.emit('chatData', { chat: chat, users: getLoginsInChat(chat) })
    callback() //so we can work after in react
    console.log('sendMessage End_____________________________________________________________________')
  })

  socket.on('changeChatNameInServer', (data, callback) => {
    console.log('\n\nchangeChatNameInServer Begin___________________________________________________________________')
    const { oldChat, newChat } = data
    console.log('=====passation du nouveau data chat name======', data)
    //changeChatName also modifies password
    if (changeChatName(oldChat, newChat)) { //success
      io.emit('getChatList', getChats()) //update select list in homepage
      socket.chat = newChat //update socket variable
      io.emit('changeChatNameInPage', data)
    } else { //fail
      callback({ error: 'Old Chat Name Does Not Exist' })
    }
    console.log('changeChatNameInServer End_____________________________________________________________________')
  })

  
  socket.on('disconnect', function () {
    console.log('\n\nBegin Disconnection______________________________________________________________________')
    if (socket.chat || socket.login) {
      console.table(['Got disconnected !', `Name Of User is ${socket.login}`, `Chatroom is ${socket.chat}`])
      console.log('1__________________________')
      const login = socket.login
      console.log('2__________________________')
      const chat = socket.chat
      console.log('3__________________________')
      // console.table([`LIST OF USER CONNECTED BEFORE ${socket.login }LEAVING ${socket.chat}`])
      // console.table([getLoginsInChat(chat)[0]])
      //faire array avec key nom du channel
      const userName = deleteUserFromChatList(socket.id, chat) //retourne false si chat nexiste plus
      if (!userName === false) {
        console.log('4__________________________')
        io.emit('message', { chatName: chat, user: 'admin', text: `${login} has left the room. You can now talk on his back !` })
        console.log('5__________________________')
        io.emit('chatData', { chat: chat, users: getLoginsInChat(chat) })
        console.table([`LIST OF USER CONNECTED AFTER ${socket.login} LEFT ${socket.chat}`, getLoginsInChat(socket.chat)[0],])
      }
      console.log('End Disconnection_______________________________________________________________________')
    }
  })
})



server.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log(`Running on port ${process.env.PORT} - ${process.env.NODE_ENV}`)
})