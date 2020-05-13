import React, { useState, useEffect } from 'react'
import queryStr from 'query-string'
import io from 'socket.io-client'
import Layout from './Layout'
import ReactDOM from 'react-dom'
import { Link, Redirect } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
let socket

const Chat = ({ location }) => {
  const [login, setLogin] = useState()
  const [chat, setChat] = useState()
  const ENDPOINT = process.env.REACT_APP_API
  // const [error, setError] = useState(null)
  // const [isLoaded, setIsLoaded] = useState(false)
  // const [items, setItems] = useState([])
  // const [blogs, setBlogs] = useState([])


  //state and state hook
  // const [values, setValues] = useState({
  //   title: 'Some Original Title',
  //   content: 'Some interesting content....',
  //   commentContent: 'Some comment...',
  //   login: match.params.login,
  //   buttonText: 'Submit'
  // })


  useEffect(() => {
    console.log('========test==========')
    const { login, chat } = queryStr.parse(location.search)
    socket = io(ENDPOINT)
    setLogin(login)
    setChat(chat)
    console.log(location.search, " || Login ==>" + login, " || Chat Name ==> " + chat)
    console.log(socket)
    console.log('========end==========')
    socket.emit('join', {login, chat})
  }, [ENDPOINT, location.search])


  // const { title, content, commentContent, password, user_id, login, buttonText } = values

  // useEffect(() => {
  //   fetch(`${process.env.REACT_APP_API}/blog/billets/all`)
  //     .then(res => res.json())
  //     .then(
  //       (result) => {
  //         setIsLoaded(true)
  //         setItems(result.billets)
  //         setBlogs(result.blogs)
  //       },
  //       (error) => {
  //         setIsLoaded(true)
  //         setError(error)
  //       }
  //     )
  // }, [])

  return (
    <Layout>
    <ToastContainer />
      <div className='row'>
        <div className='mx-auto col-6'>
          <div className='card mt-2'>
            <div className='card-body'>
              <h1 className='card-title p-5 text-center'>Chat Room</h1>
            </div>
          </div>
          {/* {joinmodal()} */}
          {/* {createmodal()} */}
        </div>
      </div>
    </Layout>
  )

}

export default Chat