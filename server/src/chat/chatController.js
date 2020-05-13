// const Chat = require("./chatModel");
// const jwt = require("jsonwebtoken");
// const path = require("path");
// const dotenv = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
// var ObjectId = require('mongoose').Types.ObjectId;
const users = []
const arr = ['chocolat', 'café', 'caramel']

const addUser = ({id, login, chat}) => { 
  login = login.trim().toLowerCase();
  chat = chat.trim().toLowerCase();

  const existingUser = users.find((user) => user.chat === chat && user.login === login)
  if (existingUser) {
    return {error:'Login is taken'}
  }

  const user = {id, login, chat}
  console.log('=======user push========', user, users)
  users.push(user)
  console.log('=======users after push========', users, arr)
  return {user}
}

const deleteUser = (id) => { 
  const index = users.findIndex((user) => users.id === id )
  if(index !== -1) {
    return users.splice(index,1)[0]
  }
}

const getUser = (id) => {
  console.log(users, arr)
  return users.filter((user) => user.id === id)
}

const getLoginsInChat = (chat) => { users.filter((user) => user.chat === chat) }

module.exports = {addUser, deleteUser, getUser, getLoginsInChat }
