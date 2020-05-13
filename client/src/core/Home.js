import React, { useState, useEffect, Fragment } from "react";
import Layout from "./Layout";
import Modal from "react-modal";
import ReactDOM from "react-dom";
import { Link, Redirect } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Button } from 'reactstrap'
import "react-toastify/dist/ReactToastify.min.css";
import axios from 'axios'

const Home = ({ match, location }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [chats, setChats] = useState();
  const [login, setLogin] = useState();
  const [chat, setChat] = useState();
  const [password, setPassword] = useState();
  const [joinModalState, setJoinModalState] = useState(false);
  const [createModalState, setCreateModalState] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API}/chat/`)
      .then(res => res.json())
      .then(
        async (result) => {
          setIsLoaded(true);
          await setChats(result);
        }
      )
  }, [])

  const onSubmit = () => {
    // headers 
    const config = {
      headers: {
        "Content-type": "application/json"
      }
    }

    //request info
    const body = JSON.stringify({ chat, password })

    axios.post('http://127.0.0.1:4141/chat', body, config)
      .then(res => {
        window.location = `/chat?login=${login}&chat=${chat}`
      })
      .catch(error => {
        toast.error(error.response.data.error)
      })
  }

  const joinForm = () => (
    <form>
      <div className="form-group">
        <label htmlFor="exampleInputEmail1">Login</label>
        <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter login" onChange={e => setLogin(e.target.value)} />
        <small id="emailHelp" className="form-text text-muted">Choose wisely young kek.</small>
      </div>
      <select className="form-control" onChange={e => e.target.value && e.target.value !== "" ? setChat(e.target.value) : null}>
        <option value="">Choose one</option>
        {chats ? chats.map((singleChat) => <option key={singleChat.chat} value={singleChat.chat}>{singleChat.chat}</option>) : null}
      </select>
      <Link onClick={e => (login && chat ? null : e.preventDefault())} to={`/chat?login=${login}&chat=${chat}`}>
        <button className="btn btn-success mt-3" onClick={() => setJoinModalState(true)}>Join</button>
      </Link>
    </form>
  )

  const createForm = () => (
    <form>
      <div className="form-group">
        <label htmlFor="exampleInputEmail1">User Login</label>
        <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="loginHelp" placeholder="Enter Login" onChange={e => setLogin(e.target.value)} />
        <small id="emailHelp" className="form-text text-muted">Choose wisely young kek.</small>
      </div>
      <div className="form-group">
        <label htmlFor="exampleInputEmail1">Room Name</label>
        <input type="text" className="form-control" id="exampleInputEmail1" aria-describedby="roomHelp" name="title" placeholder="Enter Room Name" onChange={e => setChat(e.target.value)} />
        <small id="emailHelp" className="form-text text-muted">Gas Chamber is not allowed as a name.</small>
      </div>
      <div className="form-group">
        <label htmlFor="exampleInputPassword1">Password</label>
        <input type="password" className="form-control" id="exampleInputPassword1" placeholder="Enter Complex Password" name="password" onChange={e => setPassword(e.target.value)} />
        <small id="emailHelp" className="form-text text-muted">This password is crucial, only with the password you can delete the room.</small>
      </div>
      <Button onClick={function (e) { if (!login && !chat && !password) e.preventDefault(); onSubmit() }}>
        Create
      </Button>
    </form>
  )

  const modal = (variable) => (
    <Modal ariaHideApp={false} className="modal-dialog" role="document" isOpen={eval(`${variable.toLowerCase()}ModalState`)} onRequestClose={() => eval(`set${variable}ModalState(false)`)}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title" id="exampleModalLabel">{variable} a room</h5>
          <button type="button" onClick={() => eval(`set${variable}ModalState(false)`)} className="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          {eval(`${variable.toLowerCase()}Form()`)}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => eval(`set${variable}ModalState(false)`)}>Close</button>
        </div>
      </div>
    </Modal>
  )

  const comp = (variable) => (
    <div className="row">
      <div className="mx-auto col-6">
        <div className="card mt-2">
          <div className="card-body">
            <h2 className="card-title text-center">{variable} Room</h2>
            <div className="row card-text">
              <button className="btn btn-primary mx-auto" onClick={() => eval(`set${variable}ModalState(true)`)}>{variable}</button>
            </div>
          </div>
        </div>
        {modal(variable)}
      </div>
    </div>
  )

  return (
    <Layout>
      <ToastContainer />
      {/* //make it visible only if a room already exists */}
      {comp('Join')}
      {comp('Create')}
    </Layout>
  );
}

export default Home;