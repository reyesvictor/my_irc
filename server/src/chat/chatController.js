// const Chat = require("./chatModel")
// const jwt = require("jsonwebtoken")
// const path = require("path")
// const dotenv = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
// var ObjectId = require('mongoose').Types.ObjectId
const users = {}
const arr = ['chocolat', 'café', 'caramel']

const addUser = ({ id, login, chat }) => {
  login = login.trim().toLowerCase()
  chat = chat.trim().toLowerCase()

  if (!Object.keys(users).includes(chat)) { // if chat name doesnt exist in array then create 
    users[chat] = []
  }
  const user = { id, login, chat }
  users[chat].push(user)
  console.log('===number of users connected====', users[chat].length) //donne le nombre de users connectés
  console.log(`======content of ${chat} room=====`, users[chat])
  console.log(`======list of all rooms=====`, Object.keys(users))
  return { user }
}

const deleteUserFromChatList = (id, chat) => { //returns username of person that left
  let userName = ''
  const index = users[chat].findIndex((user) => user.id === id)
  userName = users[chat][index].login
  if (index !== -1) {
    users[chat].splice(index, 1)[0]
  }
  return userName
}

const getUser = (id, chat) => {
  console.log(`(getUser())===Searching ${id} inside ${chat}======`, users, chat, arr)
  return users[chat].filter((user) => user.id === id)
}

const getLoginsInChat = (chat) => {
  //get id of all users connected to a chatroom
  list = []
  loginslist = []
  console.log(`=====verify foreach users room ${chat}=====`, Object.keys(users), users[chat])
  users[chat].forEach(user => { //users['chatroom name']
    // console.log(user.login)
    list.push(user.id)
    loginslist.push(user.login)
  })
  console.log(`=====list of logins of all users connected to ${chat}`, loginslist)
  console.log(`=====list of id of all users connected to ${chat}`, list)
  return loginslist;
}

const getLoginsList = (chat) => {
  loginslist = []
  users[chat].forEach(user => {
    loginslist.push(user.login)
  })
  return loginslist
}

module.exports = { addUser, deleteUserFromChatList, getUser, getLoginsInChat }
