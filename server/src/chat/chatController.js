const util = require('util')
let users = {}
users['default'] = []
const chatPasswords = {}
chatPasswords['default'] = []
chatPasswords['default'].push('root')

const arr = ['chocolat', 'café', 'caramel']

const addUser = ({ id, login, chat }) => {
  console.table(util.inspect(users, { showHidden: false, depth: null }))
  login = login.trim().toLowerCase()
  chat = chat.trim().toLowerCase()
  users[chat] = users[chat].filter(user => user.login !== login)
  console.log('===number of users connected====', users[chat].length) //donne le nombre de users connectés
  console.log(`======content of ${chat} room=====`, users[chat])
  console.log(`======list of all rooms=====`, Object.keys(users))
  const user = { id, login }
  console.log('\nUser has been pushed\n')
  users[chat].push(user)
  return { user }
}

const createChat = ({ password, chat }) => {
  // if (!Object.keys(users).includes(chat)) { // if chat name doesnt exist in array then create 
  if ( Object.keys(users).includes(chat) ) {
return true;
  } else {
    users[chat] = []
    chatPasswords[chat] = []
    chatPasswords[chat].push(password)
  }
  // chatPasswords[chat] = [password]
  // }
}

const deleteUserFromChatList = (id, chat) => { //returns username of person that left
  let userName = ''
  if (users && users[chat]) {
    console.table(util.inspect(chat, { showHidden: false, depth: null }))
    console.table(util.inspect(users, { showHidden: false, depth: null }))
    console.table(util.inspect(users[chat], { showHidden: false, depth: null }))
    const index = users[chat].findIndex((user) => user.id === id)
    console.table(util.inspect(users[chat][index], { showHidden: false, depth: null }))
    console.table(util.inspect(users[chat][index].login, { showHidden: false, depth: null }))
    userName = users[chat][index].login
    if (index !== -1) {
      users[chat].splice(index, 1)[0]
    }
    return userName
  }
}

const getUser = (id, chat) => {
  console.log(`(getUser())===Searching ${id} inside ${chat}======`, users, chat, arr)
  console.log('List of Rooms: ')
  console.table(Object.keys(users))
  Object.keys(users).forEach(room => {
    console.table(users[room])
  })
  // console.table(users)
  console.log('result of filer: ')
  console.log(users[chat].filter((user) => user.id === id))
  return users[chat].filter((user) => user.id === id)
}

const getLoginsInChat = (chat) => {
  list = []
  loginslist = []
  if (users && chat && users[chat]) {
    users[chat].forEach(user => { //users['chatroom name']
      loginslist.push(user.login)
    })
    console.log(`List of logins of all users connected to ${chat}`)
    console.table(util.inspect(loginslist, { showHidden: false, depth: null }))
    return loginslist;
  }
  else return false
}

const getLoginsList = (chat) => {
  loginslist = []
  users[chat].forEach(user => {
    loginslist.push(user.login)
  })
  return loginslist
}

const getChats = () => {
  const roomlist = []
  Object.keys(users).forEach(room => {
    roomlist.push(room)
  })
  console.log('All Chat Passwords')
  console.table(util.inspect(chatPasswords, { showHidden: false, depth: null }))
  console.log('Getting all chatrooms')
  console.table([roomlist])
  return roomlist
}
const verifyChatPassword = ({ adminpw, chat }) => chatPasswords[chat] == adminpw
//if chat exists, true => continue, if not, false => redirect to homepage
const verifyIfChatExists = (chat) => Object.keys(users).includes(chat) ? true : false

const changeChatName = (oldChat, newChat) => {
  if (!users || !users[oldChat]) {
    return false;
  } else {
    console.log('ALL USERS VARIABLE BEFORE CHANGING')
    console.log(util.inspect(users, { showHidden: false, depth: null }))
    users[newChat] = users[oldChat] //create new room with new name
    delete users[oldChat] //delete room
    chatPasswords[newChat] = chatPasswords[oldChat] //create new room with new name
    delete chatPasswords[oldChat] //delete room
    console.log(`NAME CHATROOM CHANGED, FROM ==> ${oldChat} TO ===> ${newChat}`)
    console.table(users[newChat], users[oldChat])
    Object.keys(users).forEach(room => {
      console.table(users[room])
    })
    console.log('ALL USERS VARIABLE')
    console.log(util.inspect(users, { showHidden: false, depth: null }))
    return true;
  }
}

module.exports = {
  addUser, deleteUserFromChatList, getUser,
  getLoginsInChat, changeChatName, getChats,
  verifyChatPassword, verifyIfChatExists, createChat
}
