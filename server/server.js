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
const io = socketio(server)
const { addUser, deleteUser, getUser, getLoginsInChat } = require('./src/chat/chatController')
// const chatRoutes = require("./src/chat/chatRoutes")
// app.use(chatRoutes)
// ==================================
const morgan = require("morgan")
const dotenv = require('dotenv').config({ path: path.resolve(__dirname, './.env') })
const bodyParser = require("body-parser")
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan("dev"))

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

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
    console.log(user, user[0], user[0].login, socket.id, '====message sent=====', message)
    io.emit(user.chat).emit('message', { user: user[0].login, text: message })
    io.emit('chatData', { chat: user.chat, users: getLoginsInChat(user.chat) })

    callback() //so we can work after in react
  })

  socket.on('disconnect', ({ login, chat }) => {
    console.log(`User has left chat room "${chat}"`)
    
  })
})

server.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log(`Running on port ${process.env.PORT} - ${process.env.NODE_ENV}`)
})
