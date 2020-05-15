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
  const [adminaccess, setAdminaccess] = useState()
  const [logins, setLogins] = useState([])
  const [login, setLogin] = useState()
  const [chat, setChat] = useState('')
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
        setLogin(login)
        setChat(chat.trim().toLowerCase())
        socket.emit('join', { login, chat }, () => {
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

        socket.on('roomIsDeletedGetOut', (room) => {
          if (room == chat) {
            toast.info('The chat was deleted because of inactivity ! You\'ll be redirected to the homepage. BYE !', { position: 'top-center' })
            setTimeout(function () {
              window.location = `/`
            }, 5000);
          }
        })

        socket.on('disconnectUser', (data) => {
          if (socket.id == data) {
            window.location = '/'
          }
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
            document.getElementById("messageBox").disabled = true;
            toast.info('The Chat was deleted. You\'ll be redirected to the homepage. BYE BYE !', { position: 'top-center' })
            setTimeout(function () {
              window.location = `/`
            }, 5000);
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

  const parseCommands = async (message) => {
    message = message.split(' ')
    switch (message[0]) {
      case '/part':
        socket.emit('disconnectFromChannel', message[1])
        break;
      case '/nick':
        if (logins.includes(message[1])) {
          toast.error('This username is already taken', { position: 'top-center' })
        }
        else {
          window.location = `/chat?login=${message[1]}&chat=${chat}`
        }
        break;
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
        break;
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
          el.style.background = 'rgba(255,0,0,' + Math.abs(Math.sin(ofs)) + ')';
          ofs += 0.01;
        }, 10);
        break;
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
      return false;
    } else {
      socket.emit('changeChatNameInServer', { newChat, oldChat: chat }, function ({ error, oldChat }) {
        if (error) { //fail at changing, probably the oldChat name  doest exist
          toast.error(error, { position: 'top-left' })
        }
      })
    }
  }

  const deleteChatroom = () => {
    socket.emit('deleteChat', { chat }, function (isChatDeleted) {
      if (isChatDeleted) { //true == no bcoz it doesnt exist
        toast.error('Chat doesnt exist !', { position: 'top-left' })
      }
    })
  }

  const adminAccess = () => (
    <div>
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
    </div>
  )

  const chatForm = () => (
    <div className="card rare-wind-gradient chat-room">
      <div className="card-body">
        <div className="row px-lg-2 px-2">
          <div className="col-md-12 col-xl-4 px-0">
            <h6 className="font-weight-bold mb-3 text-center text-lg-left">Members</h6>
            <div className="white z-depth-1 px-2 pt-3 pb-0 members-panel-1 scrollbar-light-blue">
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
            </div>
          </div>
          <div className="col-md-6 col-xl-8 pl-md-3 px-lg-auto px-0">
            <div className="chat-message">
              <ul className="list-unstyled chat-1 scrollbar-light-blue">
                {messages && messages.length > 0 ?
                  messages.map(function (message, i) {
                    return <li key={i + "-message"} className={getClass1(message)} style={{ width: 100 + '%', height: 90 + 'px' }}>
                      <div className={message.user === login.trim().toLowerCase() ?
                        "chat-body white p-1 pb-3 pl-2 pr-2  ml-3 z-depth-1 bg-dark text-white border rounded-lg"
                        :
                        "chat-body white p-1 pb-3 pl-2 pr-2 ml-3 z-depth-1 bg-light text-black border rounded-lg"
                      } style={{ width: "fit-content" }}>
                        <div className="header" style={{ height: 10 + 'px' }}>
                          <strong className="primary-font">{message.user}</strong>
                        </div>
                        <hr className="w-100" />
                        <p className="mb-0">
                          {message.text}</p>
                      </div>
                    </li>
                  })
                  : null
                }
              </ul>
              <div className="white">
                <div className="form-group basic-textarea">
                  <textarea id="messageBox" onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null}
                    className="form-control pl-2 my-0" rows="3" placeholder="Enter your message"></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const getClass1 = (message) => {
    if (message.user === login.trim().toLowerCase()) {
      return "d-flex flex-row-reverse justify-content-between mb-1 pr-3"
    } else {
      return "d-flex justify-content-between mb-1 pr-3"
    }
  }

  return (
    <Layout>
      <ToastContainer />
      <div className='row'>
        <div className='mx-auto col-12'>
          <div className='card mt-2'>
            <div className='card'>
              <h1 className='card-title p-1 text-center'>'{chat}' Chat Room</h1>
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