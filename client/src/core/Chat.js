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
  const [adminaccess, setAdminaccess] = useState()
  const [logins, setLogins] = useState([])
  const [login, setLogin] = useState()
  const [chat, setChat] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const ENDPOINT = process.env.REACT_APP_API

  // USEREFFECT POST with the chat name in the get to check if it exists. 
  // If it exists, check if last connection was over 2 weeks ago, if so, delete it and redirect user to Home.js

  //For Users
  useEffect(() => {
    console.log('========test==========')
    const { login, chat } = queryStr.parse(location.search)
    socket = io(ENDPOINT)
    setLogin(login)
    setChat(chat)
    console.log(location.search, " || Login ==> " + login, " || Chat Name ==> " + chat)
    console.log(socket)
    console.log('========end==========')
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

    socket.on('chatData', (data) => {
      if (data.chat == chat) {
        setLogins(data.users)
      }
    })

    return () => {
      // socket.emit('deleteUserFromChatList', { login, chat })
      socket.emit('disconnect')
      socket.off()
    }
  }, [ENDPOINT, location.search])


  //function send messages
  const sendMessage = (e) => {
    e.preventDefault()
    if (document.querySelector('#messageBox').value) {
      console.log('======Inside Send Message=====')
      socket.emit('sendMessage', document.getElementById('messageBox').value, () => document.querySelector('#messageBox').value = '')
    }
  }

  const checkAdmin = () => {
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    }

    //request info
    const body = JSON.stringify({ adminpw, chat })

    axios.post('http://127.0.0.1:4141/chat/admin', body, config)
      .then(res => {
        setAdminaccess(res.data.adminaccess)
      })
      .catch(error => {
        toast.error(error.response.data.error, { position: 'top-left' })
      })
  }

  const adminAccess = () => (
    <div>
      {adminaccess ?
        <div className="m-1 p-1" >
          <div className="m-1 p-1 card" style={{ width: 200 + 'px' }}>
            <label htmlFor="adminpw">New name:</label><br></br>
            <input onChange={e => setAdminpw(e.target.value)} id="adminpw" type="password"></input><br></br>
            <button className="btn btn-primary p-2 m-2" onClick={() => checkAdmin()}>Change Name</button>
            <button className="btn btn-danger p-2 m-2" onClick={() => checkAdmin()}>Delete Chatroom</button>
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

                {/* Variable à modifier par le nom des users connectés */}
                {console.log(logins)}
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
                {/* <ScrollToBottom> */}
                {console.log("_____________________________________")}
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
                          {/* <small className="pull-right text-muted"><i className="far fa-clock"></i> 12 mins ago</small> */}
                        </div>
                        <hr className="w-100" />
                        <p className="mb-0">
                          {message.text}</p>
                      </div>
                    </li>
                  })
                  : null
                }
                {/* </ScrollToBottom> */}
              </ul>

              <div className="white">
                <div className="form-group basic-textarea">
                  {/* Variable Message Ici */}
                  {/* onChange={e => { setMessage(e.target.value) }} */}
                  <textarea id="messageBox" onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null}
                    className="form-control pl-2 my-0" rows="3" placeholder="Enter your message"></textarea>
                </div>
              </div>
              {/* <button type="button" className="btn btn-outline-pink btn-rounded btn-sm waves-effect waves-dark float-right">Send</button> */}
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
        {/* {console.log('loop')} */}
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