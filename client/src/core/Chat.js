import React, { useState, useEffect } from 'react'
import queryStr from 'query-string'
import io from 'socket.io-client'
import Layout from './Layout'
import ReactDOM from 'react-dom'
import { Link, Redirect } from 'react-router-dom'
import ScrollToBottom from 'react-scroll-to-bottom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import './chatForm.css'; // Tell webpack that Button.js uses these styles

let socket

const Chat = ({ location }) => {
  const [login, setLogin] = useState()
  const [chat, setChat] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const ENDPOINT = process.env.REACT_APP_API

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

    return () => {
      socket.emit('disconnect', { login, chat })
      socket.off()
    }
  }, [ENDPOINT, location.search])


  //For Messages
  useEffect(() => {
    socket.on('message', (message) => {
      setMessages([...messages, message])
    })
  }, [messages])

  //Display List Of Users
  // useEffect(() => {
  //   socket.on('chatData', (users) => {
  //     setMessages(users)
  //   })
  // }, [users])

  //function send messages
  const sendMessage = (e) => {
    e.preventDefault()
    if (message) {
      console.log('======Inside Send Message=====')
      socket.emit('sendMessage', message, () => setMessage(''))
    }
  }

  // console.log(message, messages);

  const chatForm = () => (
    <div className="card rare-wind-gradient chat-room">
      <div className="card-body">
        <div className="row px-lg-2 px-2">
          <div className="col-md-12 col-xl-4 px-0">
            <h6 className="font-weight-bold mb-3 text-center text-lg-left">Members</h6>
            <div className="white z-depth-1 px-2 pt-3 pb-0 members-panel-1 scrollbar-light-blue">
              <ul className="list-unstyled friend-list">

                {/* Variable à modifier par le nom des users connectés */}
                {messages && messages.length > 0 ?
                  messages.map(function (message, i) {
                    return <li key={i + '-user'} className="active grey lighten-3 p-2 border border-info">
                      <a href="#" className="d-flex justify-content-between">
                        <div className="text-small text-primary">
                          <strong>{message.user}</strong>
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

              <ScrollToBottom>
                <ul className="list-unstyled chat-1 scrollbar-light-blue">
                  {messages && messages.length > 0 ?
                    messages.map(function (message, i) {

                      return <li key={i + "-message"} className={message.user === login.trim().toLowerCase() ?
                        "text-right mb-1 mr-2 border pr-3 bg-info text-white rounded-lg float-right"
                        :
                        "d-flex justify-content-between mb-1 pr-3 border bg-light text-black rounded-lg"
                      }
                        style={{ width: "fit-content" }}>
                        <div className="chat-body white p-1 pb-3 ml-3 z-depth-1" >
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
                </ul>
              </ScrollToBottom>

              <div className="white">
                <div className="form-group basic-textarea">
                  {/* Variable Message Ici */}
                  <textarea value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null}
                    className="form-control pl-2 my-0" id="exampleFormControlTextarea2" rows="3" placeholder="Enter your message"></textarea>
                </div>
              </div>
              <button type="button" className="btn btn-outline-pink btn-rounded btn-sm waves-effect waves-dark float-right">Send</button>
            </div>
          </div >
        </div >
      </div >
    </div >
  )



  return (
    <Layout>
      <ToastContainer />
      <div className='row'>
        <div className='mx-auto col-12'>
          <div className='card mt-2'>
            <div className='card-body'>
              <h1 className='card-title p-5 text-center'>{chat} Chat Room</h1>
            </div>
          </div>
          {chatForm()}
        </div>
      </div>
    </Layout>
  )

}

export default Chat