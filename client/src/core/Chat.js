import React, { useState, useEffect } from 'react'
import queryStr from 'query-string'
import io from 'socket.io-client'
import Layout from './Layout'
import ReactDOM from 'react-dom'
import { Link, Redirect } from 'react-router-dom'
import ScrollToBottom from 'react-scroll-to-bottom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import './chatForm.css' // Tell webpack that Button.js uses these styles
import { css } from 'glamor'
import axios from 'axios'

const ROOT_CSS = css({
  height: 600,
  width: 400
})
let socket

const Chat = ({ location }) => {
  const [adminpw, setAdminpw] = useState()
  const [newChat, setNewChat] = useState()
  const [newLogin, setNewLogin] = useState()
  const [adminaccess, setAdminaccess] = useState()
  const [logins, setLogins] = useState([])
  const [login, setLogin] = useState()
  const [chat, setChat] = useState('')
  const [chats, setChats] = useState([])
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const ENDPOINT = process.env.REACT_APP_API

  //For Users
  useEffect(async () => {
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    }
    await axios.post('http://127.0.0.1:4141/chat/verifyURL', { location }, config)
      .then(res => {
        toast.success('url is good')
        const { login, chat } = queryStr.parse(location.search)
        socket = io(ENDPOINT)
        socket.emit('join', { login, chat }, async ({ chats }) => {
          setLogin(login)
          setChat(chat.trim().toLowerCase())
          await setChats(chats)
        })

        //Message to All Chats
        socket.on('messageToAllChats', (message) => { // {user, text}
          setMessages(messages => [...messages, message])
          const chatMessages = document.querySelector('.chat-1')
          chatMessages.scrollTop = chatMessages.scrollHeight
        })


        //For Messages
        socket.on('message', (data) => {
          const { chatName, user, text } = data
          const message = { user, text }
          if (chatName == chat) {
            setMessages(messages => [...messages, message])
            const chatMessages = document.querySelector('.chat-1')
            chatMessages.scrollTop = chatMessages.scrollHeight
          }
        })

        //For Private Messages
        socket.on('getPrivateMessage', (data) => {
          let { user, text } = data
          user = user + " by Private message"
          const message = { user, text }
          setMessages(messages => [...messages, message])
          const chatMessages = document.querySelector('.chat-1')
          chatMessages.scrollTop = chatMessages.scrollHeight
        })

        socket.on('roomIsDeletedGetOut', (room) => {
          if (room == chat) {
            toast.info('The chat was deleted because of inactivity ! You\'ll be redirected to the homepage. BYE !', { position: 'top-center' })
            setTimeout(function () {
              window.location = `/`
            }, 5000)
          }
        })

        socket.on('disconnectUser', (data) => {
          if (socket.id == data) {
            window.location = '/'
          }
        })

        socket.on('refreshChatsList', (newChatsList) => {
          setChats(newChatsList)
        })

        socket.on('chatData', (data) => {
          if (data.chat == chat) {
            setLogins(data.users)
          }
        })

        socket.on('changeChatNameInPage', (data) => {
          const { oldChat, newChat } = data
          if (oldChat == chat) {
            setChat(newChat)
            window.location = `/chat?login=${login}&chat=${newChat}`
          }
        })

        socket.on('redirectToIndex', (data) => {
          const { oldChat } = data
          if (oldChat == chat) {
            document.getElementById("messageBox").disabled = true
            toast.info('The Chat was deleted. You\'ll be redirected to the homepage. BYE BYE !', { position: 'top-center' })
            setTimeout(function () {
              window.location = `/`
            }, 5000)
          }
        })
        return () => {
          socket.emit('disconnect')
          socket.off()
        }
      })
      .catch(error => {
        toast.error('Url Is Bad')
        window.location = '/'
      })
  }, [ENDPOINT, location.search])

  const getChatlist = () => {
    return new Promise(resolve => {
      socket.emit('getChatlist', { login, chat },
        function (data) {
          resolve(data)
        }
      )
    })
  }

  const changeNick = (nick) => {
    if (logins.includes(nick)) {
      toast.error('This username is already taken', { position: 'top-center' })
    }
    else if (/^[a-zA-Z]+$/.test(nick) && nick.length < 20 && nick.length > 2) {
      socket.emit('changeNickname', { chat: chat, oldLogin: login, newLogin: nick })
      window.location = `/chat?login=${nick}&chat=${chat}`
    }
    else {
      toast.error('Wsh, only A-Z and a-z and between 5 and 20 characters !', { position: 'top-center' })
    }
  }

  const addToNavBar = (chat, newLogin) => {
    var li = document.createElement('li')
    li.classList = "nav-item"
    var link = document.createElement("a");
    var linkText = document.createTextNode(chat);
    link.appendChild(linkText);
    link.title = message[1];
    link.classList = "nav-link"
    link.target = "_blank"
    link.style = "cursor: pointer; color: rgb(255, 255, 255);"
    link.href = `/chat?login=${newLogin}&chat=${chat}`;
    li.appendChild(link)
    document.getElementById("navbar").appendChild(li)
  }

  const parseCommands = async (message) => {
    message = message.split(' ')
    switch (message[0]) {
      case '/part':
        if ( !message[1]) {
          toast.error('Youneed to locate where you want to be disconnected. /part [ROOM]', { position: 'top-center' })
        } else{
          socket.emit('disconnectFromChannel', message[1])
        }
        break
      case '/join':
        if (message[1] && message[2]) {
          addToNavBar(message[1], message[2])
        }
        break;
      case '/msg':
        if (message[1] && message[2]) {
          let sendTo = message[1]
          let cleanMessage = message.slice(2)
          let messageSent = cleanMessage.join(" ")
          let showMeMyMessage = { user: login, text: messageSent }
          socket.emit('privatemsg', { chat, sendTo, messageSent })
          await setMessages(messages => [...messages, showMeMyMessage])
          let chatMessages = document.querySelector('.chat-1')
          chatMessages.scrollTop = chatMessages.scrollHeight
        }
        else {
          toast.error('Please make sure to follow the template /msg [USER] [MESSAGE]', { position: 'top-center' })
        }
        break
      case '/nick':
        if ( message[1] ) {
          changeNick(message[1])
        } else {
          toast.error('You need to enter a new name /nick [newlogin]', {position: 'top-center'})
        }
        break
      case '/create':
        if (!message[1] || !message[2]) {
          toast.error("To create you need the chat name and password", { position: 'top-center' })
          toast.error("/create [CHAT] [PASSWORD]", { position: 'top-center' })
        } else {
          socket.emit('createNewChat', ({ chat: message[1], password: message[2] }), async function ({ error }) {
            if (error) {
              toast.error(error, { position: 'top-center' })
            } else {
              setChats([...chats, message[1]])
            }
          })
        }
        break
      case '/delete':
        if (!message[1] || !message[2]) {
          toast.error("To delete you need the chat name and password", { position: 'top-center' })
          toast.error("/delete [CHAT] [PASSWORD]", { position: 'top-center' })
        } else {
          socket.emit('deleteChatByTerminal', { chat: message[1], password: message[2].trim() }, ({ error, newChatsList }) => {
            if (error) {
              toast.error(error, { position: 'top-center' })
            } else {
              setChats(newChatsList)
            }
          })
        }
        break
      case '/list':
        let test = await getChatlist()
        let chatList = { user: 'admin', text: 'List of chats: ' }
        test.map(function (chat) {
          if (message[1]) {
            if (chat.includes(message[1])) {
              chatList.text += chat + ' '
            }
          }
          else {
            chatList.text += chat + ' '
          }
        })
        chatList.text.replace("undefined", "")
        setMessages(messages => [...messages, chatList])
        let chatMessages = document.querySelector('.chat-1')
        chatMessages.scrollTop = chatMessages.scrollHeight
        break
      case '/users':
        let userList = { user: 'admin', text: 'List of users: ' }
        logins.map(function (login) {
          userList.text += login + ' '
        })
        userList.text.replace("undefined", "")
        setMessages(messages => [...messages, userList])
        let chatMessages2 = document.querySelector('.chat-1')
        chatMessages2.scrollTop = chatMessages2.scrollHeight
        toast.error('IT\'S LITERALLY RIGHT UNDER HERE, ARE YOU BLIND? ', { position: 'top-center' })
        let el = document.getElementsByClassName('members-panel-1')[0]
        let ofs = 0
        window.setInterval(function () {
          el.style.background = 'rgba(255,0,0,' + Math.abs(Math.sin(ofs)) + ')'
          ofs += 0.01
        }, 10)
        break
      default:
        toast.error('This command does not exist', { position: 'top-center' })
    }
  }

  //function send messages
  const sendMessage = (e) => {
    e.preventDefault()
    const message = document.querySelector('#messageBox').value
    if (message.charAt(0) == '/') {
      parseCommands(message)
      document.querySelector('#messageBox').value = ''
    }
    else if (message) {
      socket.emit('sendMessage', message, () => document.querySelector('#messageBox').value = '')
    }
  }

  const checkAdmin = () => {
    socket.emit('verifyChatPassword', { adminpw, chat }, function (isPasswordCorrect) {
      if (isPasswordCorrect) { //yes == true
        toast.success('Password is correct !')
        setAdminaccess(true)
      } else { //no == false
        toast.error('Password is incorrect !', { position: 'top-left' })
      }
    })
  }

  const changeChatName = () => {
    if (newChat == '' || !newChat) {
      toast.error('Missing new chat name')
      return false
    } else if (newChat == chat) {
      toast.error('This is the actual name')
    }
    else {
      socket.emit('changeChatNameInServer', { newChat, oldChat: chat }, function ({ error, chats }) {
        if (error) { //fail at changing, probably the oldChat name  doest exist
          toast.error(error, { position: 'top-left' })
        } else {
          setChats(chats)
        }
      })
    }
  }

  const deleteChatroom = () => {
    socket.emit('deleteChat', { chat }, function ({ chatIsNotDeleted, newChatsList }) {
      if (chatIsNotDeleted) { //true == no bcoz it doesnt exist
        toast.error('Chat doesnt exist !', { position: 'top-left' })
      }
      if (newChatsList) {
        setChats(newChatsList)
      }
    })
  }

  const adminAccess = () => (
    <div>
      <table>
        <tr>
          <td>
            {adminaccess ?
              <div className="m-1 p-1" >
                <div className="m-1 p-1 card" style={{ width: 200 + 'px' }}>
                  <label htmlFor="newChat">New name:</label><br></br>
                  <input onChange={e => setNewChat(e.target.value)} id="newChat" type="text"></input><br></br>
                  <button className="btn btn-primary p-2 m-2" onClick={() => changeChatName()}>Change Name</button>
                  <button className="btn btn-danger p-2 m-2" onClick={() => deleteChatroom()}>Delete Chatroom</button>
                </div>
              </div>
              :
              <div className="m-2 p-2 card" style={{ width: 200 + 'px' }}>
                <label htmlFor="adminpw">Access code:</label><br></br>
                <input className="mb-2" onChange={e => setAdminpw(e.target.value)} id="adminpw" type="password"></input><br></br>
                <button className="m-2 p-2" className="btn btn-primary" onClick={() => checkAdmin()}>Admin access</button>
              </div>
            }
          </td>
          <td>
            <div className="m-1 p-1" >
              <div className="m-1 p-1 card" style={{ width: 200 + 'px' }}>
                <label htmlFor="newLogin">New username:</label><br></br>
                <input onChange={e => setNewLogin(e.target.value)} id="newLogin" type="text"></input><br></br>
                <button className="btn btn-primary p-2 m-2" onClick={() => changeNick(newLogin)}>Change username</button>
              </div>
            </div>
          </td>
        </tr>

      </table>
    </div>
  )

  const chatForm = () => (
    <div className="card rare-wind-gradient chat-room">
      <div className="card-body">
        <div className="row px-lg-2 px-2">
          <div className="col-md-12 col-xl-4 px-0">
            <div className="white z-depth-1 px-2 pt-3 pb-0 members-panel-1 scrollbar-light-blue">
              <h6 className="font-weight-bold mb-3 text-center text-lg-left">Members</h6>
              <ul className="list-unstyled friend-list">
                {logins && logins.length > 0 ?
                  logins.map(function (login, i) {
                    return <li key={i + '-user'} className="active grey lighten-3 p-2 border border-info">
                      <a href="#" className="d-flex justify-content-between">
                        <div className="text-small text-primary">
                          <strong>{login}</strong>
                        </div>
                      </a>
                    </li>
                  })
                  : null
                }
              </ul>

              <h6 className="font-weight-bold mb-3 text-center text-lg-left">Chats</h6>
              <ul className="list-unstyled friend-list">
                {chats && chats.length > 0 ?
                  chats.map(function (room, i) {
                    return <li key={i + '-chat'} className="active grey lighten-3 p-2 border border-info">
                      <a href={`/chat?login=${login}&chat=${room}`} className="d-flex justify-content-between">
                        <div className="text-small text-primary">
                          <strong>{room}</strong>
                        </div>
                      </a>
                    </li>
                  })
                  : null
                }
              </ul>
            </div>
          </div>
          <div className="col-md-6 col-xl-8 pl-md-3 px-lg-auto px-0">
            <div className="chat-message">
              <ul className="list-unstyled chat-1 scrollbar-light-blue">
                {messages && messages.length > 0 ?
                  messages.map(function (message, i) {
                    return <li key={i + "-message"} className={getClassListItem(message)} style={{ width: 100 + '%', height: "fit-content" }}>
                      <div className={getClassDivCardItem(message)} style={{ width: "fit-content", height: "fit-content" }}>
                        <div className="header" style={{ height: 10 + 'px' }}>
                          <strong className="primary-font">{message.user}</strong>
                        </div>
                        <hr className="w-100" />
                        <p className="mb-0">
                          {message.text}
                        </p>
                      </div>
                    </li>
                  })
                  : null
                }
              </ul>
              <div className="white">
                <div className="form-group basic-textarea">
                  <textarea id="messageBox" onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null}
                    className="form-control pl-2 my-0" rows="3" placeholder="Enter a message. Pro tip: Send a private message by typing /msg <username> <message>"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const getClassListItem = (message) => {
    if (message.user === 'admin') return "d-flex justify-content-center mx-auto mb-1 pr-3 text-center" //admin
    else if (message.user === login.trim().toLowerCase()) return "d-flex flex-row-reverse justify-content-between mb-1 pr-3" //user connected
    else return "d-flex justify-content-between mb-1 pr-3" //another user
  }

  const getClassDivCardItem = (message) => {
    if (message.user === 'admin') return "justify-content-center text-center chat-body white p-1 pb-3 pl-2 pr-2 ml-3 z-depth-1 bg-light text-black border rounded-lg"
    else if (message.user === login.trim().toLowerCase()) return "chat-body white p-1 pb-3 pl-2 pr-2  ml-3 z-depth-1 bg-dark text-white border rounded-lg"
    else return "chat-body white p-1 pb-3 pl-2 pr-2 ml-3 z-depth-1 bg-light text-black border rounded-lg"
  }

  return (
    <Layout>
      <ToastContainer />
      <div className='row'>
        <div className='mx-auto col-12'>
          <div className='card mt-2'>
            <div className='card'>
              <h1 className='card-title p-1 text-center inline-block'>
                '{chat}' Chat Room
                <a href="/" className="btn btn-info m-2" style={{ width: 200 + 'px' }} >Leave chatroom</a>
              </h1>
              {adminAccess()}
            </div>
          </div>
          {chatForm()}
        </div>
      </div>
    </Layout>
  )
}

export default Chat