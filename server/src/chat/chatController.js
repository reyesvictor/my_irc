const util = require('util')
let users = {}
const defaultChats = ['ilikebigsockets', 'autodeletein3minutes']
const chatPasswords = {}
const chatUpdatedAt = {}
const date = Date.now()
defaultChats.map(chat => {
  users[chat] = []
  chatPasswords[chat] = []
  chatPasswords[chat].push('root')
  chatUpdatedAt[chat] = []
  if (!chatUpdatedAt[chat].length) {
    chatUpdatedAt[chat].push(date)
  }
})

const arr = ['chocolat', 'café', 'caramel']

const addUser = ({ id, login, chat }) => {
  console.table(util.inspect(users, { showHidden: false, depth: null }))
  login = login.trim().toLowerCase()
  chat = chat.trim().toLowerCase()
  users[chat] = users[chat].filter(user => user.login !== login)
  const user = { id, login }
  console.log('\nUser has been pushed\n')
  users[chat].push(user)
  return { user }
}

const createChat = ({ password, chat }) => {
  if (Object.keys(users).includes(chat)) {
    return true;
  } else {
    users[chat] = []
    chatPasswords[chat] = []
    chatPasswords[chat].push(password)
    chatUpdatedAt[chat] = []
    chatUpdatedAt[chat].push(new Date('now'))
  }
}

const deleteUserFromChatList = (id, chat) => { //returns username of person that left
  let userName = ''
  if (users && users[chat]) {
    const index = users[chat].findIndex((user) => user.id === id)
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
  console.log('result of filer: ')
  console.log(users[chat].filter((user) => user.id === id))
  return users[chat].filter((user) => user.id === id)
}

const getLoginsInChat = (chat) => {
  list = []
  loginslist = []
  if (users && chat && users[chat]) {
    users[chat].forEach(user => {
      loginslist.push(user.login)
    })
    console.log(`List of logins of all users connected to ${chat}`)
    console.table(util.inspect(loginslist, { showHidden: false, depth: null }))
    return loginslist;
  }
  else return false
}

const getUsersInChat = (chat) => {
  list = []
  idslist = []
  if (users && chat && users[chat]) {
    users[chat].forEach(user => { //users['chatroom name']
      idslist.push(user)
    })
    console.log(`List of logins of all users connected to ${chat}`)
    console.table(util.inspect(idslist, { showHidden: false, depth: null }))
    return idslist;
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

const deleteChat = (chat) => {
  if (!users[chat.chat]) return true
  delete users[chat.chat] //delete room
  delete chatPasswords[chat.chat] //delete room
  delete chatUpdatedAt[chat.chat]
}

const getChats = () => {
  const roomlist = []
  const roomDeleted = []
  Object.keys(users).forEach(room => {
    if ((Date.now() - chatUpdatedAt[room]) / (1000 * 60) > 3) { //if innactive for more than 3 min, delete
      delete users[room]
      delete chatPasswords[room]
      delete chatUpdatedAt[room]
      roomDeleted.push(room)
      console.log('Getting all chatrooms that wil be deleted')
      console.table([(Date.now() - chatUpdatedAt[room]) / (1000 * 60)])
      console.table([(Date.now() - chatUpdatedAt[room]) / (1000 * 60) > 3])
    } else {
      roomlist.push(room)
      console.log('Getting all chatrooms that wil be deleted')
      console.table([(Date.now() - chatUpdatedAt[room]) / (1000 * 60)])
      console.table([(Date.now() - chatUpdatedAt[room]) / (1000 * 60) > 3])
    }
  })
  console.log('All Chat Passwords')
  console.table(util.inspect(chatPasswords, { showHidden: false, depth: null }))
  console.log('Getting all chatrooms')
  console.table([roomlist])
  return {roomlist, roomDeleted}
}

const verifyChatPassword = ({ adminpw, chat }) => chatPasswords[chat] == adminpw
const verifyChatUpdated = ({ adminpw, chat }) => chatUpdatedAt[chat] == adminpw // à modifier <=============================
const verifyIfChatExists = (chat) => Object.keys(users).includes(chat) ? true : false //if chat exists, true => continue, if not, false => redirect to homepage
const updateChatDate = (chat) => chatUpdatedAt[chat].push(Date.now())

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
    chatUpdatedAt[newChat] = chatUpdatedAt[oldChat] //create new room with new name
    delete chatUpdatedAt[oldChat] //delete room
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
  verifyChatPassword, verifyIfChatExists,
  createChat, deleteChat, updateChatDate, getUsersInChat
}
