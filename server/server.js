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
const { addUser, deleteUserFromChatList, getUser, getLoginsInChat,
  changeChatName, getChats, verifyChatPassword, createChat,
  deleteChat, updateChatDate, getUsersInChat } = require('./src/chat/chatController')
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

io.on('connect', (socket) => {
  console.log('\n\nconnect Begin_________________________________________________________________')
  console.log('User is connected')
  const { roomlist, roomDeleted } = getChats()
  if (roomDeleted.length) {
    roomDeleted.map(room => io.emit('roomIsDeletedGetOut', room).emit('messageToAllChats', { user: 'admin', text: `The chat "${room}" is now deleted. Press F.` })) //success
  }
  io.emit('getChatList', roomlist)
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
  )

  socket.on('privatemsg', async ({ chat, sendTo, messageSent }, callback) => {
    let usersInChat = getUsersInChat(chat)
    let ourUser = usersInChat.filter(user => user.login == sendTo)[0]
    console.log(ourUser)
    io.to(ourUser.id).emit('getPrivateMessage', { user: socket.login, text: messageSent })
  })
  
  socket.on('getChatlist',
    function (data, fn) {
      const { roomlist, roomDeleted } = getChats()
      if (roomDeleted.length) {
        roomDeleted.map(room => io.emit('roomIsDeletedGetOut', room).emit('messageToAllChats', { user: 'admin', text: `The chat "${room}" is now deleted. Press F.` })) //success
      }
      fn(roomlist)
    }
  )

  //CHAT CRUD ===================
  socket.on('createNewChat', ({ chat, password }, callback) => {
    if (createChat({ chat, password })) { // if true, chat exists, return error
      callback({ error: 'Chat already exists' })
    } else {
      io.local.emit('messageToAllChats', { user: 'admin', text: `The chat"${chat}" is now created, come by say hello !` })
      callback({ message: 'OK' })
    }
  })

  socket.on('deleteChat', ({ chat }, callback) => {
    if (deleteChat({chat})) callback({chatIsNotDeleted:true}) //error
    else io.emit('redirectToIndex', { oldChat: chat }).emit('messageToAllChats', { user: 'admin', text: `The chat"${chat}" is now deleted. Press F.` }) //success
    const { roomlist, roomDeleted } = getChats()
    callback({newChatsList:roomlist})
    io.emit('refreshChatsList', roomlist)
  })

  socket.on('deleteChatByTerminal', ({ chat, password }, callback) => {
    if (deleteChat({ chat, password })) callback(deleteChat({ chat, password })) // if error return error
    else io.emit('redirectToIndex', { oldChat: chat }).emit('messageToAllChats', { user: 'admin', text: `The chat"${chat}" is now deleted. Press F.` }) //success
    const { roomlist, roomDeleted } = getChats()
    callback({newChatsList:roomlist})
    io.emit('refreshChatsList', roomlist)
  })

  socket.on('join', async ({ login, chat }, callback) => {
    console.table([`${login} has joined chat room "${chat}"`])
    const { error, user } = addUser({ id: socket.id, login, chat })
    if (error) return callback({ error }) //if addUser find an error, we return and stop the function
    socket.login = login
    socket.chat = chat
    socket.emit('message', { chatName: chat, user: 'admin', text: `${user.login}, welcome to the room ${chat}` })
    socket.broadcast.to(chat).emit('message', { chatName: chat, user: 'admin', text: `${user.login} has joined` }) //broadcast sends a message to everyone in the room except the user
    socket.join(chat)
    io.emit('chatData', { chat: chat, users: getLoginsInChat(chat) })
    const { roomlist, roomDeleted } = await getChats()
    callback({chats: roomlist}) //refresh chats list
    io.emit('refreshChatsList', roomlist)
  })

  socket.on('sendMessage', (message, callback) => {
    let str = socket.request.headers.referer
    const chat = str.split('/').reverse()[0].split('=').reverse()[0]
    updateChatDate(chat)
    console.log('socketid et chat', socket.id, chat)
    const user = getUser(socket.id, chat)
    io.emit('message', { chatName: chat, user: user[0].login, text: message })
    io.emit('chatData', { chat: chat, users: getLoginsInChat(chat) })
    callback() //so we can work after in react
  })

  socket.on('getChats', (callback) => {
    getChats()
  })
  socket.on('changeNickname', ({ chat, oldLogin, newLogin }) => 
  socket.broadcast.emit('messageToAllChats', { user: 'admin', text: `"${oldLogin}" from "${chat}" chat is pseudofluid. His new name is "${newLogin}".` })) //success

  socket.on('changeChatNameInServer', (data, callback) => {
    const { oldChat, newChat } = data
    if (changeChatName(oldChat, newChat)) { //success
      const { roomlist, roomDeleted } = getChats()
      if (roomDeleted.length) {
        roomDeleted.map(room => io.emit('roomIsDeletedGetOut', room).emit('messageToAllChats', { user: 'admin', text: `The chat "${room}" is now deleted. Press F.` })) //success
      }
      io.emit('getChatList', roomlist)
      socket.chat = newChat //update socket variable
      io.emit('changeChatNameInPage', data)
      callback({chats: roomlist}) //refresh chats list
    } else { //fail
      callback({ error: 'Old Chat Name Does Not Exist' })
    }
  })

  socket.on('disconnectFromChannel', function (chatName) {
    const { roomlist, roomDeleted } = getChats()
    if (roomDeleted.length) {
      roomDeleted.map(room => io.emit('roomIsDeletedGetOut', room).emit('messageToAllChats', { user: 'admin', text: `The chat "${room}" is now deleted. Press F.` })) //success
    }
    if (roomlist.includes(chatName)) {
      if (getLoginsInChat(chatName).includes(socket.login)) {
        let usersInChat = getUsersInChat(chatName)
        let ourUser = usersInChat.filter(user => user.login == socket.login)[0]
        io.emit('disconnectUser', ourUser.id)
      }
    }
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
      const userName = deleteUserFromChatList(socket.id, chat) //retourne false si chat nexiste plus
      if (!userName === false) {
        console.log('4__________________________')
        io.emit('message', { chatName: chat, user: 'admin', text: `${login} has left the room. You can now talk on his back !` })
        console.log('5__________________________')
        io.emit('chatData', { chat: chat, users: getLoginsInChat(chat) })
        console.table([`LIST OF USER CONNECTED AFTER ${socket.login} LEFT ${socket.chat}`, getLoginsInChat(socket.chat)[0]])
      }
      console.log('End Disconnection_______________________________________________________________________')
    }
  })
})

server.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log(`Running on port ${process.env.PORT} - ${process.env.NODE_ENV}`)
})