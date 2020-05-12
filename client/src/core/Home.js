import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import Modal from "react-modal";
import ReactDOM from "react-dom";
import { Link, Redirect } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const Home = ({ match, location }) => {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [login, setLogin] = useState();
  const [chat, setChat] = useState();
  const [password, setPassword] = useState();
  const [joinModalState, setJoinModalState] = useState(false);
  const [createModalState, setCreateModalState] = useState(false);

  // const [values, setValues] = useState({
  //   title: "Some Original Title",
  //   content: "Some interesting content....",
  //   commentContent: "Some comment...",
  //   login: match.params.login,
  //   buttonText: "Submit"
  // });

  // const { title, content, commentContent, password, user_id, login, buttonText } = values;

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API}/`)
      .then(res => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      )
  }, [])

  const joinForm = () => (
    <form>
      <div class="form-group">
        <label for="exampleInputEmail1">Login</label>
        <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter login" onChange={e => setLogin(e.target.value)} />
        <small id="emailHelp" class="form-text text-muted">Choose wisely young kek.</small>
      </div>
      <select class="form-control" onChange={e => e.target.value && e.target.value !== "" ? setChat(e.target.value) : null}>
        <option>Default select</option>
        <option value="BigPP">Big PP</option>
        <option value="SmallPP">Small PP</option>
      </select>
      <Link onClick={e => (login && chat ? null : e.preventDefault())} to={`/chat?login=${login}&chat=${chat}`}>
        <button className="btn btn-success mt-3" onClick={() => setJoinModalState(true)}>Join</button>
      </Link>
    </form>
  )

  const createForm = () => (
    <form>
      <div class="form-group">
        <label for="exampleInputEmail1">User Login</label>
        <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="loginHelp" placeholder="Enter Login" onChange={e => setLogin(e.target.value)} />
        <small id="emailHelp" class="form-text text-muted">Choose wisely young kek.</small>
      </div>
      <div class="form-group">
        <label for="exampleInputEmail1">Room Name</label>
        <input type="text" class="form-control" id="exampleInputEmail1" aria-describedby="roomHelp" placeholder="Enter Room Name" onChange={e => setChat(e.target.value)} />
        <small id="emailHelp" class="form-text text-muted">Gas Chamber is not allowed as a name.</small>
      </div>
      <div class="form-group">
        <label for="exampleInputPassword1">Password</label>
        <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Enter Complex Password" onChange={e => setPassword(e.target.value)} />
        <small id="emailHelp" class="form-text text-muted">This password is crucial, only with the password you can delete the room.</small>
      </div>
      <Link onClick={e => (login && chat && password ? null : e.preventDefault())} to={`/chat?login=${login}&chat=${chat}`}>
        <button className="btn btn-success mr-2" onClick={() => setCreateModalState(true)}>Create</button>
      </Link>
    </form>
  )

  const modal = (variable) => (
    <div className='App' >
      <Modal className="modal-dialog" role="document" isOpen={eval(`${variable.toLowerCase()}ModalState`)} onRequestClose={() => eval(`set${variable}ModalState(false)`)}>
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
    </div>
  )

  const component = (variable) => (
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
        {eval(`modal('${variable}')`)}
      </div>
    </div>
  )


  return (
    <Layout>
      <ToastContainer />
      {/* //make it visible only if a room already exists */}
      {component('Join')}
      {component('Create')}
    </Layout>
  );

}

export default Home;